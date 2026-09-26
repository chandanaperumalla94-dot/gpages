import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import useResolvedLocation from '../hooks/useResolvedLocation';
import api from '../services/api';
import PlacesSlideshow from '../components/PlacesSlideshow';
import PlaceCard from '../components/PlaceCard';
import GroupedCategoryGrid from '../components/GroupedCategoryGrid';

const CATEGORY_ICONS = {
  Schools: '🎓', Colleges: '🏢', Universities: '🏛️', Hospitals: '🏥', Clinics: '🩺', Pharmacies: '💊',
  Restaurants: '🍴', Hotels: '🛏️', 'Fashion Stores': '🛍️', 'Shopping Malls': '🏬', Banks: '🏦', Gyms: '🏋️',
  Salons: '✂️', Theatres: '🎬', 'Tourist Places': '📍', Temples: '🛕', Parks: '🌳', 'IT Companies': '🏢',
  'Coaching Centers': '📖', Libraries: '📚', 'Automobile Dealers': '🚗', 'Government Offices': '🏛️', 'Real Estate': '🏠',
};

// Dedicated wide visual for the Rajahmundry city masthead, independent of the carousel slide.
const RAJAHMUNDRY_HERO_IMAGE = 'https://cdn.tripuntold.com/media/photos/location/2018/10/29/a4ce0187-5174-44cb-89f1-01242e9bdd29.jpg';

const RAJAHMUNDRY_FAMOUS_PLACES = [
  {
    name: 'Godavari Arch Bridge',
    category: { name: 'Famous landmark' },
    address: 'Godavari River, Rajahmundry',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rajahmundry%20godavari%20bridge.jpg?width=1400',
  },
  {
    name: 'Pushkar Ghat',
    category: { name: 'Riverside attraction' },
    address: 'Godavari riverfront, Rajahmundry',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pushkara%20ghat%20rajamahendravaram.jpg?width=1400',
  },
  {
    name: 'Rajahmundry Railway Station',
    category: { name: 'City landmark' },
    address: 'Rajahmundry railway station, East Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rajahmundry%20Railway%20Station.jpg?width=1400',
  },
  {
    name: 'Rajahmundry Arch Railway Bridge',
    category: { name: 'Engineering landmark' },
    address: 'Godavari River, Rajahmundry',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rajahmundry%20arch%20railway%20bridge.jpg?width=1400',
  },
  {
    name: 'Pushkar Ghat Night View',
    category: { name: 'Scenic attraction' },
    address: 'Rajahmundry, Andhra Pradesh',
    coverImage: 'https://images.openai.com/static-rsc-4/AjPjZcjaPegB76R-WtfDoRKj96bd6-paDPi46MhPCa6_4DQ-XbN3nYzHIX05wWMlamIdstVnx4oJfBQJTSq-oeaVThwrbTZhQ0PTl6ZbFhL0TonmPB5uK5qh18uedMl0kcDnDQtzLGUn25KKbyLtbjUZfyrYH_CcFF88qzm6XCWQqpP9BIJ4jd1s6uMDfYJ0?purpose=fullsize',
  },
  {
    name: 'Shiva Fountain',
    category: { name: 'Scenic attraction' },
    address: 'Rajahmundry, Andhra Pradesh',
    coverImage: 'https://images.openai.com/static-rsc-4/Cd1zNogWmDu0hP2iz3VBf9-bzgGZJNXLYpOuzDaZQGiiAPeC2luEXT2A97c8wx6yi41AUZy7dmK6Fxg4MhlvTQKnmiub2suXcGL5sN-M3xhwxWz3-0HvhqTp6S-8fPosxmNEjfdIxpIoUhBlC9sCBT4omnD4YlHhxicYOueRPn2JkTmHSx8xcH4_ppM1xJxE?purpose=fullsize',
  },
  {
    name: 'Godavari Night View',
    category: { name: 'Scenic attraction' },
    address: 'Rajahmundry, Andhra Pradesh',
    coverImage: 'https://images.openai.com/static-rsc-4/Vya-DKBm8BI1nbDOYLC0zSQoR15aGpFjtCSeuiSPcpFD6cml9BIlwN1ssETsP9N1AMbf3rBBEBtZKDZ3GH4OZYPgkyFaJkVGeThiWETsZu2KK2AMItsRRZWLJ2bC5Wy8EfAql6T4GUoYkC4gcBmGbfUulbkIWqHyCXNgDfoVo7j0EV2vSzXMx3S9hJ5tWSQ_?purpose=fullsize',
  },
  {
    name: 'Sri Uma Markandeyeswara Temple',
    category: { name: 'Scenic attraction' },
    address: 'Rajahmundry, Andhra Pradesh',
    coverImage: 'https://images.openai.com/static-rsc-4/49c0Ug-I90CVBSOoZIze3L3cBQQwcf4ZqhHpJgWnZZ0HM-A9mg-vZnBuoTbnWunmzB0IsrIG5cqjtFrepzwlp1RULgoIuHTMYPMsU10e-g5gJ3-0rwMgYDaOL2PNExC1Xh9iiTpEKXZ1MSj_vcruWNPSqNh5r3p_vxfyTQf-fYNesvP0q4_KyKbPG-QMnH9x?purpose=fullsize',
  },
  {
    name: 'Saraswathi Ghat',
    category: { name: 'Scenic attraction' },
    address: 'Rajahmundry, Andhra Pradesh',
    coverImage: 'https://images.openai.com/static-rsc-4/Hk20lwCJOufJXOWW2gLzR6e_CoOGcsWcyA7bwUuzzz8frhol3Ha4VuNESQpAYWu8JOVRcKfG3gClnEz7iEUmLC2EcQZjt9F0tRWK0Xl5qDD789Sd88Uqm5hgz4gFHegNd6a-7losqA3D6Mr8XL-RAgo9ZscBtemUGah9XxuyjvYVgFzHr639Nqkt0cfJ_tWC?purpose=fullsize',
  },
];

const KAKINADA_FAMOUS_PLACES = [
  {
    name: 'Kakinada Beach',
    category: { name: 'Famous beach' },
    address: 'Kakinada Beach, Kakinada',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Scenic%20view%20of%20Kakinada%20beach%20during%20evening.jpg?width=1400',
  },
  {
    name: 'Coringa Wildlife Sanctuary',
    category: { name: 'Natural attraction' },
    address: 'Coringa, near Kakinada',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Coringa%20Sanctuary.jpg?width=1400',
  },
  {
    name: 'Kakinada Port',
    category: { name: 'City landmark' },
    address: 'Kakinada Port, Kakinada',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kakinada%20port.jpg?width=1400',
  },
  {
    name: 'Vakalapudi Beach',
    category: { name: 'Scenic attraction' },
    address: 'Vakalapudi, Kakinada',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vakalapudi%20Beach%20at%20Kakinada%2002.jpg?width=1400',
  },
];

const ANAKAPALLE_FAMOUS_PLACES = [
  {
    name: 'Kanyakaparameswari Temple',
    category: { name: 'Famous temple' },
    address: 'Anakapalle, Andhra Pradesh',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Anakapalle%20Kanyakaparameswari%20Temple.jpg?width=1400',
  },
  {
    name: 'Anakapalle Railway Station',
    category: { name: 'City landmark' },
    address: 'Anakapalle, Andhra Pradesh',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/AnakapalleRailwayStation.jpg?width=1400',
  },
  {
    name: 'Panchadharla Temples and Monuments',
    category: { name: 'Heritage landmark' },
    address: 'Dharapalem, near Anakapalle',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Entrance%20to%20Panchadharla%20Temples%20and%20Monuments%2C%20Dharapalem%20village%2C%20Andhra%20Pradesh.jpg?width=1400',
  },
  {
    name: 'Anakapalle Railway Station Board',
    category: { name: 'Local landmark' },
    address: 'Anakapalle, Andhra Pradesh',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Anakapalle%20railway%20station%20board.jpg?width=1400',
  },
];

const ADDITIONAL_CITY_FAMOUS_PLACES = {
  paderu: [
    { name: 'Vanjangi Hills', category: { name: 'Scenic attraction' }, address: 'Vanjangi, near Paderu', coverImage: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Vanjangi_hills_-_paderu_-_andhrapradesh_%286%29.jpg' },
    { name: 'Paderu Hill View Point', category: { name: 'Scenic attraction' }, address: 'Paderu, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vanjangi%20hills%20-%20paderu%20-%20andhrapradesh%20%285%29.jpg?width=1400' },
    { name: 'Minumuluru Waterfalls', category: { name: 'Natural attraction' }, address: 'Minumuluru, near Paderu', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Darakonda%20falls.jpg?width=1400' },
    { name: 'Matsyagundam', category: { name: 'Natural attraction' }, address: 'Matsyagundam, near Paderu', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Araku12.jpg?width=1400' },
    { name: 'Kothapalli Waterfalls', category: { name: 'Natural attraction' }, address: 'Near Paderu, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kothapally%20water%20falls.jpg?width=1400' },
  ],
  anantapur: [
    { name: 'Lepakshi Veerabhadra Temple', category: { name: 'Famous temple' }, address: 'Lepakshi, near Anantapur', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/AP%20Lepakshi%20Veerabhadra%20Temple.jpg?width=1400' },
    { name: 'Thimmamma Marrimanu', category: { name: 'Natural landmark' }, address: 'Near Anantapur, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Thimmamma-marrimanu%201.jpg?width=1400' },
    { name: 'Gooty Fort', category: { name: 'Historic landmark' }, address: 'Gooty, near Anantapur', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shell%20shaped%20gooty%20fort.jpg?width=1400' },
    { name: 'Puttaparthi', category: { name: 'Famous pilgrimage town' }, address: 'Puttaparthi, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/PrashantiNilayam%202.jpg?width=1400' },
    { name: 'Penukonda Fort', category: { name: 'Historic landmark' }, address: 'Penukonda, near Anantapur', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Penukonda%20Fort%20Anantapur.jpg?width=1400' },
    { name: 'ISKCON Anantapur Temple', category: { name: 'Famous temple' }, address: 'Anantapur, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/ISKCON%20Temple%20Anantpur%2C%20Andhra%20Pradesh.jpg?width=1400' },
  ],
  rayachoti: [
    { name: 'Sri Veerabhadra Swamy Temple', category: { name: 'Famous temple' }, address: 'Rayachoti, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/RACHAVEEDU%20TEMPLE.jpg?width=1400' },
    { name: 'Gandi Sir Anjaneya Temple', category: { name: 'Famous temple' }, address: 'Gandi, near Rayachoti', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gandi%20Anjaneya%20Swamy.jpg?width=1400' },
    { name: 'Rayachoti Fort', category: { name: 'Historic landmark' }, address: 'Rayachoti, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gandikota%20Fort.jpg?width=1400' },
    { name: 'Devapatla Temple', category: { name: 'Famous temple' }, address: 'Devapatla, near Rayachoti', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/RACHAVEEDU%20TEMPLE.jpg?width=1400' },
    { name: 'Gandikota Fort and Gorge', category: { name: 'Historic landmark' }, address: 'Gandikota, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gandikota%20gorge.jpg?width=1400' },
    { name: 'Talakona Waterfalls', category: { name: 'Natural attraction' }, address: 'Talakona, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Talakona%20waterfall.jpg?width=1400' },
  ],
  bapatla: [
    { name: 'Suryalanka Beach', category: { name: 'Famous beach' }, address: 'Suryalanka, near Bapatla, Andhra Pradesh', coverImage: '/images/bapatla/suryalanka-beach.jpg' },
    { name: 'Vodarevu Beach', category: { name: 'Famous beach' }, address: 'Vodarevu, near Bapatla, Andhra Pradesh', coverImage: '/images/bapatla/vodarevu-beach.jpg' },
    { name: 'Ramapuram Beach', category: { name: 'Famous beach' }, address: 'Ramapuram, near Bapatla, Andhra Pradesh', coverImage: '/images/bapatla/ramapuram-beach.jpg' },
  ],
  chittoor: [
    { name: 'Kanipakam Vinayaka Temple', category: { name: 'Famous temple' }, address: 'Kanipakam, near Chittoor, Andhra Pradesh', coverImage: '/images/chittoor/kanipakam-vinayaka-temple.jpg' },
    { name: 'Sri Venkateswara Temple (Tirupati)', category: { name: 'Famous temple' }, address: 'Tirumala, near Chittoor, Andhra Pradesh', coverImage: '/images/chittoor/sri-venkateswara-temple-tirupati.jpg' },
    { name: 'Srikalahasti Temple', category: { name: 'Famous temple' }, address: 'Srikalahasti, near Chittoor, Andhra Pradesh', coverImage: '/images/chittoor/srikalahasti-temple.jpg' },
    { name: 'Gudimallam Parasuramesvara Temple', category: { name: 'Heritage temple' }, address: 'Gudimallam, near Chittoor, Andhra Pradesh', coverImage: '/images/chittoor/gudimallam-temple.jpg' },
    { name: 'Horsley Hills', category: { name: 'Scenic attraction' }, address: 'Near Chittoor, Andhra Pradesh', coverImage: '/images/chittoor/horsley-hills.jpg' },
    { name: 'Kalisakona Waterfalls', category: { name: 'Natural attraction' }, address: 'Near Chittoor, Andhra Pradesh', coverImage: '/images/chittoor/kalisakona-waterfalls.jpg' },
    { name: 'Kaigal Falls', category: { name: 'Natural attraction' }, address: 'Near Chittoor, Andhra Pradesh', coverImage: '/images/chittoor/kaigal-falls.jpg' },
    { name: 'Koundinya Wildlife Sanctuary', category: { name: 'Wildlife sanctuary' }, address: 'Near Chittoor, Andhra Pradesh', coverImage: '/images/chittoor/koundinya-wildlife-sanctuary.jpg' },
  ],
  eluru: [
    { name: 'Dwaraka Tirumala Temple', category: { name: 'Famous temple' }, address: 'Near Eluru, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dwaraka%20Tirumala%20Andhra%20Pradesh.jpg?width=1400' },
    { name: 'Kolleru Lake', category: { name: 'Natural attraction' }, address: 'Near Eluru, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Panorama%20of%20Kolleru%20Lake%201.jpg?width=1400' },
    { name: 'Guntupalli Caves', category: { name: 'Heritage landmark' }, address: 'Guntupalli, near Eluru, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Guntupalli%20caves.jpg?width=1400' },
    { name: 'Kolleru Bird Sanctuary', category: { name: 'Wildlife sanctuary' }, address: 'Kolleru, near Eluru, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Birds%20in%20Kolleru%20Lake%20captured%20near%20Devi%20Chintapadu%20%2804%29.jpg?width=1400' },
    { name: 'Eluru Buddha Park', category: { name: 'Cultural attraction' }, address: 'Eluru, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Buddha%20Park%20eluru%20Entrance%20Phylon.jpg?width=1400' },
  ],
  guntur: [
    { name: 'Amaravati Stupa', category: { name: 'Heritage landmark' }, address: 'Amaravati, near Guntur, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Amaravati%20Stupa.JPG?width=1400' },
    { name: 'Uppalapadu Bird Sanctuary', category: { name: 'Natural attraction' }, address: 'Uppalapadu, near Guntur, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aerial%20top%20down%20view%20of%20Uppalapadu%20Bird%20Sanctuary.jpg?width=1400' },
  ],
  kurnool: [
    { name: 'Kondareddy Buruju', category: { name: 'Historic landmark' }, address: 'Kurnool, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/21%20-%20Front%20View%20of%20Kondareddy%20Buruju.JPG?width=3000' },
    { name: 'Orvakal Rock Garden', category: { name: 'Natural attraction' }, address: 'Orvakal, near Kurnool, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rock%20Gardens%20Near%20Kurnool.jpg?width=3000' },
    { name: 'Belum Caves', category: { name: 'Natural attraction' }, address: 'Near Kurnool, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Belum%20Caves.jpg?width=3000' },
    { name: 'Yaganti Uma Maheswara Temple', category: { name: 'Famous temple' }, address: 'Yaganti, Kurnool region, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Yaganti%20cave%20temple%20view.jpg?width=3000' },
    { name: 'Mahanandi Temple', category: { name: 'Famous temple' }, address: 'Mahanandi, near Kurnool, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mahanadi%20Temple%2C%20Mahanandi%2C%20Andhra%20Pradesh%20India%20-%207.jpg?width=3000' },
  ],
  nuzvid: [
    { name: 'Nuzvid Fort Gate', category: { name: 'Historic landmark' }, address: 'Nuzvid, Eluru district, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nuzvid%20Fort%20Gate.jpg?width=1400' },
    { name: 'Nuzvid Town', category: { name: 'Local attraction' }, address: 'Nuzvid, Eluru district, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nuzvid.jpg?width=1400' },
    { name: 'Rajiv Gandhi University, Nuzvid', category: { name: 'Educational landmark' }, address: 'Nuzvid, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/I1%20block%2C%20Rajiv%20Gandhi%20University%20of%20Knowledge%20Technologies%2C%20Nuzvid..jpg?width=1400' },
  ],
  nandyal: [
    { name: 'Mahanandi Temple', category: { name: 'Famous temple' }, address: 'Mahanandi, near Nandyal, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mahanadi%20Temple%2C%20Mahanandi%2C%20Andhra%20Pradesh%20India%20-%207.jpg?width=1400' },
    { name: 'Yaganti Temple', category: { name: 'Historic temple' }, address: 'Yaganti, near Nandyal, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Yaganti%20Temple%20in%20Andhra%20Pradesh.jpg?width=1400' },
    { name: 'Nallamala Forest', category: { name: 'Natural attraction' }, address: 'Nandyal district, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nallamala%20Forest%2C%20Nandyal%20District.jpg?width=1400' },
    { name: 'Mahanandi Temple Gopuram', category: { name: 'Heritage landmark' }, address: 'Mahanandi, near Nandyal, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mahanandi%20Temple%20Gopuram%2001.jpg?width=1400' },
  ],
  narasaraopet: [
    { name: 'Kotappakonda Temple', category: { name: 'Famous temple' }, address: 'Kotappakonda, near Narasaraopet, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Temple%20Kotappa%20Konda.jpg?width=1400' },
    { name: 'Guthikonda Caves', category: { name: 'Natural attraction' }, address: 'Guttikonda, near Narasaraopet, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Guttikonda%20%283%29.jpg?width=1400' },
    { name: 'Narasaraopet Railway Station', category: { name: 'City landmark' }, address: 'Narasaraopet, Palnadu district, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Narasaraopet%20Railway%20Station.jpg?width=1400' },
  ],
  parvathipuram: [
    { name: 'Sri Venkateswara Temple, Balijipeta', category: { name: 'Famous temple' }, address: 'Balijipeta, near Parvathipuram, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sri%20Venkateswara%20Temple%2C%20Balijipeta%20Village%2C%20Parvatipuram%20Manyam%20Dist.%2C%20Andhra%20Pradesh%2011.jpg?width=1400' },
    { name: 'Parvathipuram Hill Scenery', category: { name: 'Scenic attraction' }, address: 'Parvathipuram, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Parvathipuram%20-%20Hill%20Scenery.JPG?width=1400' },
    { name: 'Kamalingeswara Temple', category: { name: 'Heritage temple' }, address: 'Gallavilli, Parvathipuram Manyam, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kamalingeswara%20Temple%2C%20Gallavilli%2C%20Andhra%20Pradesh%20-%2001.jpg?width=1400' },
  ],
  ongole: [
    { name: 'Kothapatnam Beach', category: { name: 'Famous beach' }, address: 'Kothapatnam, near Ongole, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kothapatnam-beach.jpg?width=1400' },
    { name: 'Ongole Cattle', category: { name: 'Local attraction' }, address: 'Ongole, Prakasam district, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ongole%20cattle%20of%20Andhra%20Pradesh%2014%2036%2033%20994000.jpeg?width=1400' },
  ],
  nellore: [
    { name: 'Talpagiri Ranganatha Swamy Temple', category: { name: 'Famous temple' }, address: 'Nellore, Andhra Pradesh', coverImage: 'https://cdn.s3waas.gov.in/s39c82c7143c102b71c593d98d96093fde/uploads/2024/09/2024091365.jpg' },
    { name: 'Mypadu Beach', category: { name: 'Famous beach' }, address: 'Mypadu, near Nellore, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mypadu%20Beach.jpg?width=1400' },
    { name: 'Nellore Ranganayakula Swamy Temple', category: { name: 'Heritage temple' }, address: 'Nellore, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nellore%20ranganayakula%20swamy%20temple.jpg?width=1400' },
  ],
  puttaparthi: [
    { name: 'Prasanthi Nilayam', category: { name: 'Famous landmark' }, address: 'Puttaparthi, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/PrashantiNilayam1.jpg?width=1400' },
    { name: 'Chaitanya Jyothi Museum', category: { name: 'Cultural landmark' }, address: 'Puttaparthi, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chaitanya%20Jyothi%20Museum%2C%20Prashanthi%20Nilayam%2C%20India.jpg?width=1400' },
    { name: 'Puttaparthi Town', category: { name: 'Pilgrimage town' }, address: 'Puttaparthi, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Puttaparthi%20AP%20Dec%202015%203.jpg?width=1400' },
  ],
  srikakulam: [
    { name: 'Arasavalli Sun Temple', category: { name: 'Famous temple' }, address: 'Arasavalli, near Srikakulam, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Arasavalli-srikakulam%20temple.jpg?width=1400' },
    { name: 'Srikurmam Temple', category: { name: 'Heritage landmark' }, address: 'Srikurmam, near Srikakulam, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Srikurmam%20Temple%20view%20Srikakulam.jpg?width=1400' },
    { name: 'Srikurmanatha Swamy Temple', category: { name: 'Famous temple' }, address: 'Srikurmam, Srikakulam district, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Srikurmanatha%20swamy%20temple%2C%20Srikurmam%2C%20Srikakulam%20Varahaswamy.jpg?width=1400' },
  ],
  tirupati: [
    { name: 'Tirumala Venkateswara Temple', category: { name: 'Famous temple' }, address: 'Tirumala, Tirupati', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tirumala%20Venkateswara%20Temple%2C%20Tirupati%20%2823710079574%29.jpg?width=2000' },
    { name: 'Kapila Theertham', category: { name: 'Famous attraction' }, address: 'Tirupati, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kapila%20Theertham%20waterfalls%20Tirupati%202015%201.jpg?width=2000' },
    { name: 'Govindaraja Swamy Temple', category: { name: 'Famous temple' }, address: 'Tirupati, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Govindaraja%20Swamy%20Temple%20-%20Tirupati%20%284%29.jpg?width=2000' },
    { name: 'Govindaraja Temple Main Gopuram', category: { name: 'Heritage landmark' }, address: 'Tirupati, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Main%20gopuram%20govindaraja%20swamy%20temple%20tirupati.JPG?width=2000' },
  ],
  'visakhapatnam city': [
    { name: 'RK Beach', category: { name: 'Famous beach' }, address: 'Visakhapatnam, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/RK%20Beach%20Visakhapatnam%20Nov%202012.JPG?width=2000' },
    { name: 'Kailasagiri', category: { name: 'Scenic attraction' }, address: 'Visakhapatnam, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kailasagiri%20hill%20park%20in%20Visakhapatnam%2001.jpg?width=3000' },
    { name: 'Rushikonda Beach', category: { name: 'Famous beach' }, address: 'Visakhapatnam, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aerial%20view%20of%20Rushikonda%20beach.jpg?width=2000' },
    { name: 'Simhachalam Temple', category: { name: 'Famous temple' }, address: 'Visakhapatnam, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Simhachalam%20Temple%20Frontview.jpg?width=3000' },
  ],
  vizianagaram: [
    { name: 'Vizianagaram Fort', category: { name: 'Historic landmark' }, address: 'Vizianagaram, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/West%20Entrance%20of%20the%20Vizianagaram%20fort%20in%20Andhra%20Pradesh.jpg?width=2500' },
    { name: 'Pydithalli Ammavari Temple', category: { name: 'Famous temple' }, address: 'Vizianagaram, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Paiditalli%20Temple%2C%20Vijayanagaram.jpeg?width=2500' },
    { name: 'Vizianagaram Ganta Stambham', category: { name: 'City landmark' }, address: 'Vizianagaram, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vizianagaram%20Ganta%20Stambham.jpg?width=2500' },
  ],
  kadapa: [
    { name: 'Gandikota Fort', category: { name: 'Historic landmark' }, address: 'Gandikota, near Kadapa, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gandikota%20fort%20Penna%20river%20view.jpg?width=3000' },
    { name: 'Vontimitta Kodandarama Temple', category: { name: 'Famous temple' }, address: 'Vontimitta, near Kadapa, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/16th%20century%20Kodandarama%20temple%2C%20Vontimitta%2C%20Andhra%20Pradesh%20India%20-%2001.jpg?width=3000' },
    { name: 'Madhavaraya Swamy Temple, Gandikota', category: { name: 'Heritage temple' }, address: 'Gandikota, Kadapa district, Andhra Pradesh', coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Madhavaraya%20Swamy%20Temple%20Gandikota%20Kadapa%20Andhra%20Pradesh%20PIC%200079.jpg?width=2500' },
  ],
};

const BHIMAVARAM_FAMOUS_PLACES = [
  {
    name: 'Somarama Temple',
    category: { name: 'Famous temple' },
    address: 'Bhimavaram, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Somaramam%20Temple%20Gopuram%2C%20at%20Bhimavaram.jpg?width=1400',
  },
  {
    name: 'Mavullamma Temple',
    category: { name: 'Famous temple' },
    address: 'Bhimavaram, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mavullamma%20jatara.jpg?width=1400',
  },
  {
    name: 'Bhimavaram Junction Railway Station',
    category: { name: 'City landmark' },
    address: 'Bhimavaram, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bhimavaram%20Junction%20Railway%20station%204.jpg?width=1400',
  },
  {
    name: 'Bhimavaram Town Railway Station',
    category: { name: 'Railway landmark' },
    address: 'Bhimavaram, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bhimavaram%20town%20railway%20station.jpg?width=1400',
  },
  {
    name: 'Bhimavaram Town',
    category: { name: 'Local attraction' },
    address: 'Bhimavaram, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bhimavaram%20town%2C%20AP.jpg?width=1400',
  },
  {
    name: 'Bhimavaram RTC Bus Station',
    category: { name: 'City landmark' },
    address: 'Bhimavaram, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bhimavaram%20RTC%20bus%20station1.jpg?width=1400',
  },
];

const NARASAPURAM_FAMOUS_PLACES = [
  {
    name: 'Godavari Riverside',
    category: { name: 'Natural attraction' },
    address: 'Narasapuram, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dawn%20%40%20Godavari.JPG?width=1400',
  },
  {
    name: 'Adikesava Embarmannar Swamy Temple',
    category: { name: 'Historic temple' },
    address: 'Narasapuram, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kovela.jpg?width=1400',
  },
];

const TADEPALLIGUDEM_FAMOUS_PLACES = [
  {
    name: 'Tadepalligudem Railway Station',
    category: { name: 'City landmark' },
    address: 'Tadepalligudem, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tadepalligudem%20Railway%20Station%2C%20AP.JPG?width=1400',
  },
  {
    name: 'Sri Sarvamangala Devi Temple',
    category: { name: 'Temple' },
    address: 'Tadepalligudem, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sri%20Sarvamangala%20devi%20at%20Sankaramatham%2C%20Tadepalligudem.jpg?width=1400',
  },
  {
    name: 'Sri Vasavi College Campus',
    category: { name: 'Local landmark' },
    address: 'Tadepalligudem, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sri%20Vasavi%20College%20Campus.jpg?width=1400',
  },
];

const TANUKU_FAMOUS_PLACES = [
  {
    name: 'Arthur Cotton Statue',
    category: { name: 'Historic landmark' },
    address: 'Tanuku, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Arthur%20Cotton%20statue%20Tanuku%2C%20AP.jpg?width=1400',
  },
  {
    name: 'Tanuku Railway Station',
    category: { name: 'City landmark' },
    address: 'Tanuku, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/TANUKU%20RLY%20STATION.jpg?width=1400',
  },
  {
    name: 'Tanuku Town View',
    category: { name: 'Local attraction' },
    address: 'Tanuku, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tanuku%20town%20view.jpg?width=1400',
  },
];

const PALAKOLLU_FAMOUS_PLACES = [
  {
    name: 'Ksheera Ramalingeswara Swamy Temple',
    category: { name: 'Famous temple' },
    address: 'Palakollu, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ksheeraramalingeswara%20Swamy%20temple%20Gopuram%20from%20Palakollu.jpg?width=1400',
  },
  {
    name: 'Ksheeraramam Temple Complex',
    category: { name: 'Heritage landmark' },
    address: 'Palakollu, West Godavari',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/CompleteTempleComplex.jpg?width=1400',
  },
];

const AMALAPURAM_FAMOUS_PLACES = [
  {
    name: 'Amalapuram Temple',
    category: { name: 'Famous temple' },
    address: 'Amalapuram, Dr. B. R. Ambedkar Konaseema',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/AmalapuramTemple.JPG?width=1400',
  },
  {
    name: 'Amalapuram Landmark',
    category: { name: 'City landmark' },
    address: 'Amalapuram, Dr. B. R. Ambedkar Konaseema',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Amalapuram%20LandMark.jpg?width=1400',
  },
  {
    name: 'Godavari River at Amalapuram',
    category: { name: 'Natural attraction' },
    address: 'Amalapuram, Dr. B. R. Ambedkar Konaseema',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Godavari%20River%20%40Amalapuram.jpg?width=1400',
  },
  {
    name: 'Konaseema Coconut Groves',
    category: { name: 'Scenic attraction' },
    address: 'Amalapuram, Dr. B. R. Ambedkar Konaseema',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/అమలాపురంలో%20కొబ్బరి%20చెట్లు%20IMG20190405062002.jpg?width=1400',
  },
];

const VIJAYAWADA_FAMOUS_PLACES = [
  {
    name: 'Kanaka Durga Temple',
    category: { name: 'Famous temple' },
    address: 'Indrakeeladri, Vijayawada',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Temple%20in%20vijayawada.png?width=1400',
  },
  {
    name: 'Prakasam Barrage',
    category: { name: 'Famous landmark' },
    address: 'Krishna River, Vijayawada',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Indrakeeladri%20and%20Prakasam%20Barrage%20from%20Tadepalli%20%2802%29.jpg?width=1400',
  },
  {
    name: 'Vijayawada Railway Station',
    category: { name: 'City landmark' },
    address: 'Vijayawada, NTR district',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/VijayawadaRailwayStation.jpg?width=1400',
  },
  {
    name: 'Indrakeeladri Hill',
    category: { name: 'Scenic attraction' },
    address: 'Vijayawada, NTR district',
    coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Indrakeeladri%20in%20Vijayawada.jpg?width=1400',
  },
];

const MACHILIPATNAM_FAMOUS_PLACES = [
  {
    name: 'Manginapudi Beach',
    category: { name: 'Famous beach' },
    address: 'Manginapudi, near Machilipatnam, Andhra Pradesh',
    coverImage: '/images/machilipatnam/manginapudi-beach.jpg',
  },
  {
    name: 'Panduranga Swamy Temple',
    category: { name: 'Famous temple' },
    address: 'Chilakalapudi, Machilipatnam, Andhra Pradesh',
    coverImage: '/images/machilipatnam/panduranga-swamy-temple.jpg',
  },
  {
    name: 'Machilipatnam Lighthouse',
    category: { name: 'Coastal landmark' },
    address: 'Machilipatnam, Andhra Pradesh',
    coverImage: '/images/machilipatnam/machilipatnam-lighthouse.jpg',
  },
];

export default function CityPage() {
  const { state, district, city } = useParams();
  const [searchParams] = useSearchParams();
  const area = searchParams.get('area') || undefined;
  const navigate = useNavigate();

  const { resolved, loading: loadingLocation, error: locationError } = useResolvedLocation({
    state,
    district,
    city,
    area,
  });

  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!resolved?.city) return;
    const cityId = resolved.city._id;

    api
      .get('/places/trending', { params: { city: cityId, limit: 6 } })
      .then(({ data }) => setTrending(data.data))
      .catch(() => {});

    api
      .get('/places', { params: { city: cityId, sort: 'newest', limit: 8 } })
      .then(({ data }) => setLatest(data.data))
      .catch(() => {});
  }, [resolved]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}&city=${resolved?.city?._id || ''}`);
  };

  if (loadingLocation) {
    return <div className="container-page py-20 text-center text-ink/50">Loading…</div>;
  }

  if (locationError || !resolved?.city) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Location not found</h1>
        <p className="mt-2 text-ink/55">We couldn't find that state, district or city.</p>
        <Link to="/" className="mt-4 inline-block text-vermilion underline underline-offset-2">
          Back to homepage
        </Link>
      </div>
    );
  }

  const cityName = resolved.city.name;
  const cityKey = cityName.toLowerCase();
  const popularPlaces = cityKey === 'paderu'
    ? ADDITIONAL_CITY_FAMOUS_PLACES.paderu
    : cityKey === 'anantapur'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.anantapur
    : cityKey === 'rayachoti'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.rayachoti
    : cityKey === 'bapatla'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.bapatla
    : cityKey === 'chittoor'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.chittoor
    : cityKey === 'eluru'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.eluru
    : cityKey === 'guntur'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.guntur
    : cityKey === 'nuzvid'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.nuzvid
    : cityKey === 'nandyal'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.nandyal
    : cityKey === 'narasaraopet'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.narasaraopet
    : cityKey === 'parvathipuram'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.parvathipuram
    : cityKey === 'ongole'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.ongole
    : cityKey === 'nellore'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.nellore
    : cityKey === 'puttaparthi'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.puttaparthi
    : cityKey === 'srikakulam'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.srikakulam
    : cityKey === 'tirupati'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.tirupati
    : cityKey === 'visakhapatnam city'
      ? ADDITIONAL_CITY_FAMOUS_PLACES['visakhapatnam city']
    : cityKey === 'vizianagaram'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.vizianagaram
    : cityKey === 'kadapa'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.kadapa
    : cityKey === 'kurnool'
      ? ADDITIONAL_CITY_FAMOUS_PLACES.kurnool
    : cityKey === 'rajahmundry'
    ? [...RAJAHMUNDRY_FAMOUS_PLACES.slice(8), ...RAJAHMUNDRY_FAMOUS_PLACES.slice(0, 8)]
    : cityKey === 'kakinada'
      ? KAKINADA_FAMOUS_PLACES
    : cityKey === 'anakapalle'
      ? ANAKAPALLE_FAMOUS_PLACES
    : cityKey === 'bhimavaram'
      ? BHIMAVARAM_FAMOUS_PLACES
      : cityKey === 'narasapuram'
        ? NARASAPURAM_FAMOUS_PLACES
        : cityKey === 'tadepalligudem'
          ? TADEPALLIGUDEM_FAMOUS_PLACES
          : cityKey === 'tanuku'
          ? TANUKU_FAMOUS_PLACES
          : cityKey === 'palakollu'
              ? PALAKOLLU_FAMOUS_PLACES
              : cityKey === 'amalapuram'
                ? AMALAPURAM_FAMOUS_PLACES
                : cityKey === 'vijayawada'
                  ? VIJAYAWADA_FAMOUS_PLACES
                  : cityKey === 'machilipatnam'
                    ? MACHILIPATNAM_FAMOUS_PLACES
      : trending;
  const featuredCityPlace =
    popularPlaces.find((place) => place.coverImage || place.images?.[0]) ||
    trending.find((place) => place.coverImage || place.images?.[0]);
  const cityHeroImage = featuredCityPlace?.coverImage || featuredCityPlace?.images?.[0];
  const heroImage = cityKey === 'rajahmundry' ? RAJAHMUNDRY_HERO_IMAGE : cityHeroImage;

  return (
    <div className="city-page">
      <section className="city-hero relative overflow-hidden border-b border-line">
        <div className="container-page relative overflow-hidden py-6 sm:py-7">
          {heroImage && <img src={heroImage} alt="" aria-hidden="true" className="city-hero-background" />}
          <div className="city-hero-overlay" />
          <div className="relative z-10">
          <p className="relative text-xs font-medium text-ink/65 sm:text-sm">
            {resolved.state?.name} {resolved.district && `› ${resolved.district.name}`}
          </p>
          <div className="relative mt-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-[38px]">{cityName}</h1>
          </div>
          <p className="relative mt-2 max-w-lg text-[15px] text-ink/75">
            Explore the best places, businesses and organizations in {cityName}.
          </p>

          <form onSubmit={handleSearch} className="relative mt-5 flex max-w-xl gap-2">
            <div className="relative min-w-0 flex-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/55"><circle cx="11" cy="11" r="6" strokeWidth="2" /><path d="m16 16 4 4" strokeWidth="2" strokeLinecap="round" /></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search in ${cityName}…`}
              className="w-full rounded-lg border border-line bg-white/95 py-3 pl-11 pr-3 text-[15px] shadow-sm outline-none focus:border-blue-500"
            />
            </div>
            <button type="submit" className="rounded-lg bg-blue-600 px-7 py-2.5 text-[15px] font-semibold text-white shadow-sm hover:bg-blue-700">
              Search
            </button>
          </form>
          </div>
        </div>
      </section>

      {popularPlaces.length > 0 && (
        <section className="container-page py-6 sm:py-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">Popular places in {cityName}</h2>
            <Link to={`/search?city=${resolved.city._id}`} className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="mt-3">
            <PlacesSlideshow places={popularPlaces} />
          </div>
        </section>
      )}

      <section className="border-y border-line bg-[#f7fbff] py-14 sm:py-16">
        <div className="container-page">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Explore smarter</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">What are you looking for?</h2>
              <p className="mt-1 text-sm text-ink/55">Find trusted places in {cityName} by category.</p>
            </div>
            <Link to="/categories" className="hidden rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 sm:block">View all categories →</Link>
          </div>
          <GroupedCategoryGrid categories={categories} cityPath={`/${state}/${district}/${city}`} />
        </div>
      </section>

      {latest.length > 0 && (
        <section className="container-page py-6 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">Latest listings</h2>
            <Link to={`/search?city=${resolved.city._id}`} className="text-sm font-medium text-blue-600 hover:underline">View all listings</Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((place) => (
              <PlaceCard key={place._id} place={place} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
