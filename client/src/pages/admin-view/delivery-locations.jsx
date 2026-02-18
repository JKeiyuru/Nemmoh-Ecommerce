// client/src/pages/admin-view/delivery-locations.jsx

/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllLocationsAdmin,
  addCounty,
  updateCounty,
  deleteCounty,
  addSubCounty,
  deleteSubCounty,
  addLocation,
  updateLocation,
  deleteLocation,
  seedLocations,
} from "@/store/admin/delivery-location-slice";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2, MapPin,
  Database, RefreshCw, Check, X,
} from "lucide-react";

// ─── Inline editable field ────────────────────────────────────────────────────
function InlineEdit({ value, onSave, onCancel, type = "text", className = "" }) {
  const [val, setVal] = useState(value);
  return (
    <span className={`flex items-center gap-1 ${className}`}>
      <Input
        type={type}
        value={val}
        onChange={e => setVal(type === "number" ? Number(e.target.value) : e.target.value)}
        className="h-7 px-2 py-0 text-sm w-40"
        autoFocus
        onKeyDown={e => { if (e.key === "Enter") onSave(val); if (e.key === "Escape") onCancel(); }}
      />
      <button onClick={() => onSave(val)} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
      <button onClick={onCancel} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
    </span>
  );
}

// ─── Location Row ─────────────────────────────────────────────────────────────
function LocationRow({ loc, countyId, subCountyId, onDelete }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [editingName, setEditingName] = useState(false);
  const [editingFee, setEditingFee] = useState(false);

  const save = (field, value) => {
    dispatch(updateLocation({ countyId, subCountyId, locationId: loc._id, [field]: value }))
      .then(r => {
        if (r.payload?.success) toast({ title: "Location updated" });
        else toast({ title: r.payload?.message || "Failed", variant: "destructive" });
      });
    setEditingName(false);
    setEditingFee(false);
  };

  return (
    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded border text-sm">
      <span className="flex items-center gap-2 flex-1">
        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
        {editingName
          ? <InlineEdit value={loc.name} onSave={v => save("name", v)} onCancel={() => setEditingName(false)} />
          : <span className="cursor-pointer hover:underline" onClick={() => setEditingName(true)}>{loc.name}</span>
        }
      </span>
      <span className="flex items-center gap-3">
        {editingFee
          ? <InlineEdit value={loc.deliveryFee} type="number" onSave={v => save("deliveryFee", v)} onCancel={() => setEditingFee(false)} className="w-32" />
          : <Badge
              variant={loc.deliveryFee === 0 ? "default" : "secondary"}
              className={`cursor-pointer ${loc.deliveryFee === 0 ? "bg-green-600" : ""}`}
              onClick={() => setEditingFee(true)}
            >
              {loc.deliveryFee === 0 ? "🎉 FREE" : `KSh ${loc.deliveryFee}`}
            </Badge>
        }
        <button onClick={() => setEditingName(true)} className="text-blue-500 hover:text-blue-700"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
      </span>
    </div>
  );
}

// ─── Sub-county panel ─────────────────────────────────────────────────────────
function SubCountyPanel({ sc, countyId, onDelete }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocFee, setNewLocFee] = useState(0);
  const [addingLoc, setAddingLoc] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleAddLocation = () => {
    if (!newLocName.trim()) return toast({ title: "Location name required", variant: "destructive" });
    dispatch(addLocation({ countyId, subCountyId: sc._id, name: newLocName.trim(), deliveryFee: Number(newLocFee) }))
      .then(r => {
        if (r.payload?.success) { toast({ title: "Location added" }); setNewLocName(""); setNewLocFee(0); setAddingLoc(false); }
        else toast({ title: r.payload?.message || "Failed", variant: "destructive" });
      });
  };

  const handleDeleteLocation = (locId, locName) => setDeleteTarget({ locId, locName });

  const confirmDeleteLocation = () => {
    if (!deleteTarget) return;
    dispatch(deleteLocation({ countyId, subCountyId: sc._id, locationId: deleteTarget.locId }))
      .then(r => {
        if (r.payload?.success) toast({ title: "Location deleted" });
        else toast({ title: r.payload?.message || "Failed", variant: "destructive" });
        setDeleteTarget(null);
      });
  };

  return (
    <div className="ml-4 border-l-2 border-gray-200 pl-3 mt-2">
      <div className="flex items-center justify-between py-1">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {sc.name}
          <Badge variant="outline" className="text-xs ml-1">{sc.locations?.length || 0} locations</Badge>
        </button>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 ml-2"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>

      {open && (
        <div className="space-y-1 mt-1 mb-3">
          {sc.locations?.map(loc => (
            <LocationRow
              key={loc._id} loc={loc} countyId={countyId} subCountyId={sc._id}
              onDelete={() => handleDeleteLocation(loc._id, loc.name)}
            />
          ))}

          {addingLoc ? (
            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-200">
              <Input placeholder="Location name" value={newLocName} onChange={e => setNewLocName(e.target.value)} className="h-7 text-sm flex-1" />
              <Input type="number" placeholder="Fee (KSh)" value={newLocFee} onChange={e => setNewLocFee(e.target.value)} className="h-7 text-sm w-28" />
              <button onClick={handleAddLocation} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
              <button onClick={() => setAddingLoc(false)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setAddingLoc(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 ml-2">
              <Plus className="w-3 h-3" /> Add Location
            </button>
          )}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.locName}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLocation} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── County card ──────────────────────────────────────────────────────────────
function CountyCard({ county, onRefresh }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [addingSubCounty, setAddingSubCounty] = useState(false);
  const [newSubCountyName, setNewSubCountyName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleAddSubCounty = () => {
    if (!newSubCountyName.trim()) return toast({ title: "Sub-county name required", variant: "destructive" });
    dispatch(addSubCounty({ countyId: county._id, name: newSubCountyName.trim() }))
      .then(r => {
        if (r.payload?.success) { toast({ title: "Sub-county added" }); setNewSubCountyName(""); setAddingSubCounty(false); }
        else toast({ title: r.payload?.message || "Failed", variant: "destructive" });
      });
  };

  const handleDeleteSubCounty = (scId, scName) => setDeleteTarget({ scId, scName, type: "subcounty" });
  const handleDeleteCounty = () => setDeleteTarget({ type: "county" });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "county") {
      dispatch(deleteCounty(county._id)).then(r => {
        if (r.payload?.success) { toast({ title: "County deleted" }); onRefresh(); }
        else toast({ title: r.payload?.message || "Failed", variant: "destructive" });
        setDeleteTarget(null);
      });
    } else {
      dispatch(deleteSubCounty({ countyId: county._id, subCountyId: deleteTarget.scId })).then(r => {
        if (r.payload?.success) toast({ title: "Sub-county deleted" });
        else toast({ title: r.payload?.message || "Failed", variant: "destructive" });
        setDeleteTarget(null);
      });
    }
  };

  const totalLocations = county.subCounties?.reduce((a, sc) => a + (sc.locations?.length || 0), 0) || 0;

  return (
    <Card className="mb-3">
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 font-semibold text-gray-800 hover:text-gray-900">
            {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {county.county}
            <Badge variant="secondary" className="text-xs">{county.subCounties?.length || 0} sub-counties · {totalLocations} locations</Badge>
            {!county.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(updateCounty({ id: county._id, data: { isActive: !county.isActive } }))}
              className="text-xs text-gray-500 hover:text-gray-700 border rounded px-2 py-0.5"
            >
              {county.isActive ? "Deactivate" : "Activate"}
            </button>
            <button onClick={handleDeleteCounty} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-2 pb-3">
          {county.subCounties?.map(sc => (
            <SubCountyPanel
              key={sc._id} sc={sc} countyId={county._id}
              onDelete={() => handleDeleteSubCounty(sc._id, sc.name)}
            />
          ))}

          {addingSubCounty ? (
            <div className="flex items-center gap-2 mt-2 bg-green-50 p-2 rounded border border-green-200">
              <Input placeholder="Sub-county name" value={newSubCountyName} onChange={e => setNewSubCountyName(e.target.value)} className="h-7 text-sm" />
              <button onClick={handleAddSubCounty} className="text-green-600"><Check className="w-4 h-4" /></button>
              <button onClick={() => setAddingSubCounty(false)} className="text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setAddingSubCounty(true)} className="flex items-center gap-1 text-sm text-green-700 hover:text-green-900 mt-2">
              <Plus className="w-4 h-4" /> Add Sub-County
            </button>
          )}
        </CardContent>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "county"
                ? `Delete entire county "${county.county}" and all its data?`
                : `Delete sub-county "${deleteTarget?.scName}"?`}
              {" "}This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function AdminDeliveryLocations() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { locationList, isLoading } = useSelector(s => s.deliveryLocations);
  const [newCountyName, setNewCountyName] = useState("");
  const [addingCounty, setAddingCounty] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const refresh = () => dispatch(fetchAllLocationsAdmin());

  useEffect(() => { refresh(); }, [dispatch]);

  const handleAddCounty = () => {
    if (!newCountyName.trim()) return toast({ title: "County name required", variant: "destructive" });
    dispatch(addCounty(newCountyName.trim())).then(r => {
      if (r.payload?.success) { toast({ title: "County added" }); setNewCountyName(""); setAddingCounty(false); refresh(); }
      else toast({ title: r.payload?.message || "Failed", variant: "destructive" });
    });
  };

  const handleSeed = () => {
    setSeeding(true);
    dispatch(seedLocations()).then(r => {
      if (r.payload?.success) { toast({ title: r.payload.message }); refresh(); }
      else toast({ title: r.payload?.message || "Seed failed", variant: "destructive" });
      setSeeding(false);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Locations &amp; Fees</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage counties, sub-counties, and delivery charges. Click any value to edit it inline.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding || isLoading}>
            <Database className="w-4 h-4 mr-1" /> {seeding ? "Seeding…" : "Import Defaults"}
          </Button>
          <Button size="sm" onClick={() => setAddingCounty(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add County
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3 text-sm text-blue-800 space-y-1">
          <p><strong>Tips:</strong></p>
          <p>• Click any <Badge className="bg-green-600 text-xs">🎉 FREE</Badge> or <Badge variant="secondary" className="text-xs">KSh 150</Badge> fee badge to edit the amount inline.</p>
          <p>• Set fee to <strong>0</strong> for free delivery (e.g., CBD locations).</p>
          <p>• Use <strong>Deactivate</strong> to hide a county from customers without deleting it.</p>
          <p>• Click <strong>Import Defaults</strong> to load the built-in Kenya location data (skips existing counties).</p>
        </CardContent>
      </Card>

      {/* Add county form */}
      {addingCounty && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="p-3 flex items-center gap-2">
            <Label className="text-sm font-medium">New County:</Label>
            <Input
              placeholder="e.g. Nakuru"
              value={newCountyName}
              onChange={e => setNewCountyName(e.target.value)}
              className="h-8 max-w-xs"
              autoFocus
              onKeyDown={e => { if (e.key === "Enter") handleAddCounty(); if (e.key === "Escape") setAddingCounty(false); }}
            />
            <Button size="sm" onClick={handleAddCounty}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAddingCounty(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      {/* County list */}
      {isLoading && !locationList.length ? (
        <div className="text-center py-12 text-gray-500">Loading locations…</div>
      ) : locationList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No delivery locations yet.</p>
            <p className="text-sm mt-1">Click <strong>Import Defaults</strong> to get started quickly, or add a county manually.</p>
          </CardContent>
        </Card>
      ) : (
        locationList.map(county => (
          <CountyCard key={county._id} county={county} onRefresh={refresh} />
        ))
      )}
    </div>
  );
}

export default AdminDeliveryLocations;