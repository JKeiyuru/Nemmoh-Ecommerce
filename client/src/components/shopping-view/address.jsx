// client/src/components/shopping-view/address.jsx

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useDispatch, useSelector } from "react-redux";
import { addNewAddress, deleteAddress, editAddress, fetchAllAddresses } from "@/store/shop/address-slice";
import { fetchPublicLocations } from "@/store/admin/delivery-location-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Truck } from "lucide-react";

const initialFormData = {
  county: "", subCounty: "", location: "", specificAddress: "",
  phone: "", notes: "", deliveryFee: 0,
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [subCounties, setSubCounties] = useState([]);
  const [locations, setLocations] = useState([]);

  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { addressList } = useSelector(s => s.shopAddress);
  const { publicList: locationData, isLoading: locLoading } = useSelector(s => s.deliveryLocations);
  const { toast } = useToast();

  // Load locations from DB
  useEffect(() => {
    if (!locationData.length) dispatch(fetchPublicLocations());
  }, [dispatch, locationData.length]);

  // Update sub-counties when county changes
  useEffect(() => {
    if (formData.county) {
      const countyObj = locationData.find(c => c.county === formData.county);
      setSubCounties(countyObj?.subCounties || []);
      setFormData(prev => ({ ...prev, subCounty: "", location: "", deliveryFee: 0 }));
      setLocations([]);
    } else {
      setSubCounties([]);
      setLocations([]);
    }
  }, [formData.county, locationData]);

  // Update locations when sub-county changes
  useEffect(() => {
    if (formData.county && formData.subCounty) {
      const countyObj = locationData.find(c => c.county === formData.county);
      const scObj = countyObj?.subCounties?.find(sc => sc.name === formData.subCounty);
      setLocations(scObj?.locations || []);
      setFormData(prev => ({ ...prev, location: "", deliveryFee: 0 }));
    } else {
      setLocations([]);
    }
  }, [formData.county, formData.subCounty, locationData]);

  // Update delivery fee when location changes
  useEffect(() => {
    if (formData.location && locations.length) {
      const locObj = locations.find(l => l.name === formData.location);
      setFormData(prev => ({ ...prev, deliveryFee: locObj?.deliveryFee ?? 0 }));
    }
  }, [formData.location, locations]);

  function handleSelect(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function isFormValid() {
    return formData.county.trim() && formData.subCounty.trim() &&
      formData.location.trim() && formData.specificAddress.trim() && formData.phone.trim();
  }

  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      toast({ title: "You can save a maximum of 3 addresses", variant: "destructive" });
      return;
    }
    if (!isFormValid()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const addressData = {
      county: formData.county,
      subCounty: formData.subCounty,
      location: formData.location,
      specificAddress: formData.specificAddress,
      phone: formData.phone,
      notes: formData.notes,
      deliveryFee: formData.deliveryFee,
      address: `${formData.specificAddress}, ${formData.location}, ${formData.subCounty}, ${formData.county}`,
    };

    if (currentEditedId !== null) {
      dispatch(editAddress({ userId: user?.id, addressId: currentEditedId, formData: addressData }))
        .then(d => {
          if (d?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setCurrentEditedId(null);
            setFormData(initialFormData);
            toast({ title: "Address updated successfully" });
          }
        });
    } else {
      dispatch(addNewAddress({ ...addressData, userId: user?.id }))
        .then(d => {
          if (d?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setFormData(initialFormData);
            toast({ title: "Address added successfully" });
          }
        });
    }
  }

  function handleDeleteAddress(addr) {
    dispatch(deleteAddress({ userId: user?.id, addressId: addr._id }))
      .then(d => { if (d?.payload?.success) { dispatch(fetchAllAddresses(user?.id)); toast({ title: "Address deleted" }); } });
  }

  function handleEditAddress(addr) {
    setCurrentEditedId(addr._id);
    setFormData({
      county: addr.county || "",
      subCounty: addr.subCounty || "",
      location: addr.location || "",
      specificAddress: addr.specificAddress || "",
      phone: addr.phone || "",
      notes: addr.notes || "",
      deliveryFee: addr.deliveryFee || 0,
    });
  }

  useEffect(() => { dispatch(fetchAllAddresses(user?.id)); }, [dispatch, user?.id]);

  return (
    <Card>
      {/* Saved addresses */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {addressList?.map(addr => (
          <AddressCard
            key={addr._id}
            selectedId={selectedId}
            handleDeleteAddress={handleDeleteAddress}
            addressInfo={addr}
            handleEditAddress={handleEditAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />
        ))}
      </div>

      <CardHeader>
        <CardTitle>{currentEditedId ? "Edit Address" : "Add New Address"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleManageAddress} className="space-y-4">
          {/* County */}
          <div className="space-y-1.5">
            <Label>County <span className="text-red-500">*</span></Label>
            <Select value={formData.county} onValueChange={v => handleSelect("county", v)} disabled={locLoading}>
              <SelectTrigger><SelectValue placeholder={locLoading ? "Loading…" : "Select County"} /></SelectTrigger>
              <SelectContent>
                {locationData.map(c => <SelectItem key={c._id} value={c.county}>{c.county}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-county */}
          <div className="space-y-1.5">
            <Label>Sub-County <span className="text-red-500">*</span></Label>
            <Select value={formData.subCounty} onValueChange={v => handleSelect("subCounty", v)} disabled={!formData.county}>
              <SelectTrigger><SelectValue placeholder="Select Sub-County" /></SelectTrigger>
              <SelectContent>
                {subCounties.map(sc => <SelectItem key={sc._id} value={sc.name}>{sc.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label>Location <span className="text-red-500">*</span></Label>
            <Select value={formData.location} onValueChange={v => handleSelect("location", v)} disabled={!formData.subCounty}>
              <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc._id} value={loc.name}>
                    {loc.name} — {loc.deliveryFee === 0 ? "🎉 FREE delivery" : `KSh ${loc.deliveryFee}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specific address */}
          <div className="space-y-1.5">
            <Label>Specific Address <span className="text-red-500">*</span></Label>
            <Textarea
              placeholder="Building name, street, landmark…"
              value={formData.specificAddress}
              onChange={e => handleSelect("specificAddress", e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label>Phone Number <span className="text-red-500">*</span></Label>
            <Input
              type="tel" placeholder="e.g. 0712 345 678"
              value={formData.phone}
              onChange={e => handleSelect("phone", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Delivery Notes (optional)</Label>
            <Textarea
              placeholder="Any special delivery instructions…"
              value={formData.notes}
              onChange={e => handleSelect("notes", e.target.value)}
            />
          </div>

          {/* Delivery fee display */}
          {formData.location && (
            <div className={`p-3 rounded-lg border flex justify-between items-center ${formData.deliveryFee === 0 ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Truck className="w-4 h-4" /> Delivery Fee
              </span>
              <Badge className={formData.deliveryFee === 0 ? "bg-green-600" : "bg-blue-600"}>
                {formData.deliveryFee === 0 ? "🎉 FREE" : `KSh ${formData.deliveryFee}`}
              </Badge>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!isFormValid()}>
            {currentEditedId ? "Update Address" : "Save Address"}
          </Button>

          {currentEditedId && (
            <Button type="button" variant="ghost" className="w-full" onClick={() => { setCurrentEditedId(null); setFormData(initialFormData); }}>
              Cancel Edit
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default Address;