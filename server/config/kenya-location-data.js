// server/config/kenya-location-data.js
// Mirrors the client-side config — used only for the one-time seed endpoint.

const kenyaLocationData = {
  Nairobi: {
    name: "Nairobi",
    subCounties: {
      Westlands: {
        name: "Westlands",
        locations: [
          { name: "Westlands", deliveryFee: 150 },
          { name: "Parklands", deliveryFee: 150 },
          { name: "Highridge", deliveryFee: 180 },
          { name: "Karura", deliveryFee: 200 },
        ],
      },
      "Dagoretti North": {
        name: "Dagoretti North",
        locations: [
          { name: "Kilimani", deliveryFee: 120 },
          { name: "Kawangware", deliveryFee: 180 },
          { name: "Gatina", deliveryFee: 200 },
          { name: "Kileleshwa", deliveryFee: 150 },
        ],
      },
      Langata: {
        name: "Langata",
        locations: [
          { name: "Karen", deliveryFee: 200 },
          { name: "Nairobi West", deliveryFee: 150 },
          { name: "South C", deliveryFee: 150 },
        ],
      },
      Starehe: {
        name: "Starehe",
        locations: [
          { name: "Nairobi Central (CBD)", deliveryFee: 0 },
          { name: "Ngara", deliveryFee: 120 },
          { name: "Nairobi South", deliveryFee: 110 },
        ],
      },
      Roysambu: {
        name: "Roysambu",
        locations: [
          { name: "Githurai", deliveryFee: 200 },
          { name: "Kahawa West", deliveryFee: 220 },
          { name: "Zimmerman", deliveryFee: 180 },
          { name: "Roysambu", deliveryFee: 190 },
        ],
      },
      Kasarani: {
        name: "Kasarani",
        locations: [
          { name: "Kasarani", deliveryFee: 170 },
          { name: "Mwiki", deliveryFee: 180 },
          { name: "Njiru", deliveryFee: 220 },
        ],
      },
    },
  },
  Kiambu: {
    name: "Kiambu",
    subCounties: {
      "Thika Town": {
        name: "Thika Town",
        locations: [
          { name: "Township", deliveryFee: 300 },
          { name: "Gatuanyaga", deliveryFee: 350 },
        ],
      },
      Ruiru: {
        name: "Ruiru",
        locations: [
          { name: "Biashara", deliveryFee: 250 },
          { name: "Kahawa Sukari", deliveryFee: 230 },
          { name: "Kahawa Wendani", deliveryFee: 240 },
        ],
      },
      Juja: {
        name: "Juja",
        locations: [
          { name: "Juja", deliveryFee: 270 },
          { name: "Witeithie", deliveryFee: 300 },
        ],
      },
    },
  },
  Kajiado: {
    name: "Kajiado",
    subCounties: {
      "Kajiado North": {
        name: "Kajiado North",
        locations: [
          { name: "Rongai", deliveryFee: 200 },
          { name: "Ngong", deliveryFee: 220 },
        ],
      },
      "Kajiado East": {
        name: "Kajiado East",
        locations: [{ name: "Kitengela", deliveryFee: 250 }],
      },
    },
  },
  Machakos: {
    name: "Machakos",
    subCounties: {
      "Athi River": {
        name: "Athi River",
        locations: [
          { name: "Athi River", deliveryFee: 300 },
          { name: "Syokimau/Mulolongo", deliveryFee: 280 },
        ],
      },
    },
  },
  Mombasa: {
    name: "Mombasa",
    subCounties: {
      Mvita: {
        name: "Mvita",
        locations: [
          { name: "Mji Wa Kale/Makadara", deliveryFee: 300 },
          { name: "Tudor", deliveryFee: 320 },
        ],
      },
    },
  },
};

module.exports = { kenyaLocationData };