export interface GearItem {
  id: string
  name: string
  spec: string
  status: 'PACKED' | 'ESSENTIAL' | 'READY'
  weight: string
  weightGrams: number
  note: string
  category: 'SHELTER & SLEEP' | 'COOK & WATER' | 'NAVIGATION & TOOLS' | 'PACK & APPAREL'
  insightId?: string
}

export interface LoadoutCategory {
  name: string
  items: GearItem[]
}

export interface LoadoutKit {
  id: string
  season: 'AUTUMN' | 'WINTER' | 'SPRING' | 'SUMMER'
  label: string
  title: string
  subtitle: string
  tempRange: string
  terrain: string
  baseWeightKg: number
  categories: LoadoutCategory[]
}

export interface GearInsight {
  id: string
  tag: string
  category: 'DURABILITY' | 'THERMAL' | 'MAINTENANCE' | 'PHILOSOPHY'
  title: string
  date: string
  readTime: string
  image: string
  equipmentTested: string
  duration: string
  summary: string
  observations: string[]
  verdict: string
  telemetry: { label: string; value: string }[]
}

export const mockLoadoutKits: LoadoutKit[] = [
  {
    id: 'AUTUMN',
    season: 'AUTUMN',
    label: 'Autumn / Taiga',
    title: 'Autumn Taiga & Lake Bivouac',
    subtitle: 'Solo gapahuk bivouac, cold mist, peat wetlands, and frost nights',
    tempRange: '-2°C to 10°C',
    terrain: 'Old-growth spruce taiga & granite ridges',
    baseWeightKg: 4.88,
    categories: [
      {
        name: 'SHELTER & SLEEP',
        items: [
          {
            id: 'aut-1',
            name: 'Hilleberg Akto 1P Tent',
            spec: 'Kerlon 1200 • 1.7 kg • 4-Season Solo Tunnel',
            status: 'PACKED',
            weight: '1,700g',
            weightGrams: 1700,
            note: 'Proven in gale-force winds on exposed Nordmarka crags. Bone dry inside.',
            category: 'SHELTER & SLEEP',
            insightId: 'insight-1'
          },
          {
            id: 'aut-2',
            name: 'Western Mountaineering Antelope MF',
            spec: '850+ Fill Goose Down • -10°C Limit • Microfiber Shell',
            status: 'PACKED',
            weight: '1,105g',
            weightGrams: 1105,
            note: 'Breathable microfiber shell sheds frost and gapahuk timber condensation effortlessly.',
            category: 'SHELTER & SLEEP'
          },
          {
            id: 'aut-3',
            name: 'Therm-a-Rest NeoAir XTherm NXT',
            spec: 'R-Value 7.3 • 7.6cm Thickness • WingLock Valve',
            status: 'PACKED',
            weight: '439g',
            weightGrams: 439,
            note: 'Impervious to ground frost when sleeping directly on granite bedrock shelves.',
            category: 'SHELTER & SLEEP',
            insightId: 'insight-4'
          }
        ]
      },
      {
        name: 'COOK & WATER',
        items: [
          {
            id: 'aut-4',
            name: 'Trangia 27-1 UL Hard Anodized',
            spec: 'Spirit Burner Kit • Simmer Ring • 2x 1.0L Pots',
            status: 'PACKED',
            weight: '690g',
            weightGrams: 690,
            note: 'Dead-reliable in freezing autumn rain using clean denatured bio-ethanol.',
            category: 'COOK & WATER',
            insightId: 'insight-2'
          },
          {
            id: 'aut-5',
            name: 'Katadyn BeFree 1.0L Microfilter',
            spec: '0.1 Micron EZ-Clean Membrane • Collapsible TPU Bladder',
            status: 'PACKED',
            weight: '63g',
            weightGrams: 63,
            note: 'Rapid flow rate from cold glacial tarns and peat-filtered forest springs.',
            category: 'COOK & WATER'
          },
          {
            id: 'aut-6',
            name: 'Hand-Carved Lapland Kuksa',
            spec: 'Salt-cured Birch Burl • Braided Leather Lanyard • 180ml',
            status: 'PACKED',
            weight: '110g',
            weightGrams: 110,
            note: 'Traditional morning coffee and boiling brook water drinking vessel.',
            category: 'COOK & WATER'
          }
        ]
      },
      {
        name: 'NAVIGATION & TOOLS',
        items: [
          {
            id: 'aut-7',
            name: 'Silva Expedition S Compass',
            spec: 'Global Needle • Mirror Sight • Clinometer • 1:25k Romer',
            status: 'ESSENTIAL',
            weight: '86g',
            weightGrams: 86,
            note: 'Precision magnetic bearing navigation across unmarked forest ridges.',
            category: 'NAVIGATION & TOOLS'
          },
          {
            id: 'aut-8',
            name: 'Nordmarka 1:25,000 Topo Map',
            spec: 'Tyvek Synthetic Waterproof Sheet • Annotated Waypoints',
            status: 'ESSENTIAL',
            weight: '45g',
            weightGrams: 45,
            note: 'Hand-annotated shelter waypoints, freshwater springs, and contour lines.',
            category: 'NAVIGATION & TOOLS'
          },
          {
            id: 'aut-9',
            name: 'Morakniv Garberg Carbon Knife',
            spec: 'Full Tang • 3.2mm Swedish Carbon Steel • Leather Sheath',
            status: 'ESSENTIAL',
            weight: '272g',
            weightGrams: 272,
            note: 'Batoning birch firewood, carving hearth pegs, and striking ferro rods.',
            category: 'NAVIGATION & TOOLS',
            insightId: 'insight-5'
          },
          {
            id: 'aut-13',
            name: 'Modular Field Repair Kit',
            spec: 'Tenacious Tape • Sailmaker Needle • Kevlar Thread • Copper Wire',
            status: 'ESSENTIAL',
            weight: '85g',
            weightGrams: 85,
            note: 'Ultralight self-rescue hardware kit for field tent, boot, and binding repair.',
            category: 'NAVIGATION & TOOLS',
            insightId: 'insight-6'
          }
        ]
      },
      {
        name: 'PACK & APPAREL',
        items: [
          {
            id: 'aut-10',
            name: 'Fjällräven Kajka 55 Pack',
            spec: 'FSC-Certified Birch Wood Frame • Vinylon-F Canvas',
            status: 'READY',
            weight: '2,800g',
            weightGrams: 2800,
            note: 'Uncompromising load carriage across rugged uneven bog and boulder fields.',
            category: 'PACK & APPAREL'
          },
          {
            id: 'aut-11',
            name: 'Woolpower Ullfrotté 400 Mittens',
            spec: '70% Merino Wool • Circular Loop-Knit • Reinforced Palm',
            status: 'READY',
            weight: '120g',
            weightGrams: 120,
            note: 'Maintains insulation and heat even when completely soaked in bog mud.',
            category: 'PACK & APPAREL'
          },
          {
            id: 'aut-12',
            name: 'Lundhags Vandra High Shell Boots',
            spec: 'Certech 3.0 Cellular Rubber Base • Heinen Terracare Leather',
            status: 'READY',
            weight: '1,520g',
            weightGrams: 1520,
            note: 'Unlined modular leather shell boot designed for instant bog water drainage and drying.',
            category: 'PACK & APPAREL',
            insightId: 'insight-3'
          }
        ]
      }
    ]
  },
  {
    id: 'WINTER',
    season: 'WINTER',
    label: 'Winter / Sub-Zero',
    title: 'Winter Sub-Zero Ski Expedition',
    subtitle: 'Deep snowpack, frozen lake crossings, pulk freight, and snow shelter survival',
    tempRange: '-25°C to -4°C',
    terrain: 'Deep powdery taiga, frozen lakes & high barren fells',
    baseWeightKg: 8.42,
    categories: [
      {
        name: 'SHELTER & SLEEP',
        items: [
          {
            id: 'win-1',
            name: 'Hilleberg Keron 3 GT',
            spec: 'Kerlon 1800 • Extended Vestibule • Double-Pole Rigging',
            status: 'PACKED',
            weight: '4,600g',
            weightGrams: 4600,
            note: 'Bombproof expedition tunnel tent with expansive porch for gear thaw.',
            category: 'SHELTER & SLEEP'
          },
          {
            id: 'win-2',
            name: 'Western Mountaineering Puma GWS',
            spec: '850+ Goose Down • -32°C Rating • Gore Windstopper',
            status: 'PACKED',
            weight: '1,530g',
            weightGrams: 1530,
            note: 'Absolute sub-zero furnace; windstopper shell blocks frost rime buildup.',
            category: 'SHELTER & SLEEP'
          },
          {
            id: 'win-3',
            name: 'Dual Pad: XTherm NXT + Evazote 14mm',
            spec: 'Combined R-Value 9.2 • 200cm x 65cm Full Coverage',
            status: 'PACKED',
            weight: '720g',
            weightGrams: 720,
            note: 'Dual-layer defense preventing all heat transfer into sub-zero blue ice.',
            category: 'SHELTER & SLEEP',
            insightId: 'insight-4'
          }
        ]
      },
      {
        name: 'COOK & WATER',
        items: [
          {
            id: 'win-4',
            name: 'MSR XGK EX Multi-Fuel Stove',
            spec: 'Liquid White Gas • Shaker Jet • Metal Fuel Pump',
            status: 'PACKED',
            weight: '384g',
            weightGrams: 384,
            note: 'Roars flawlessly at -25°C. Melts compacted drift snow in under 5 minutes.',
            category: 'COOK & WATER'
          },
          {
            id: 'win-5',
            name: 'MSR Titan 2.0L Titanium Pot',
            spec: 'Wide Snow-Melt Base • Snug Fitted Lid • Wire Handle',
            status: 'PACKED',
            weight: '172g',
            weightGrams: 172,
            note: 'Optimal surface area for rapid thermal transfer from multi-fuel burner.',
            category: 'COOK & WATER'
          },
          {
            id: 'win-6',
            name: 'Hydro Flask 1.0L Trail Vacuum Flask',
            spec: 'Double-Wall TempShield • Ultralight Titanium Inset',
            status: 'PACKED',
            weight: '340g',
            weightGrams: 340,
            note: 'Keeps boiling pine-needle tea hot for 24 hours in sub-zero rime frost.',
            category: 'COOK & WATER'
          }
        ]
      },
      {
        name: 'NAVIGATION & TOOLS',
        items: [
          {
            id: 'win-7',
            name: 'Black Diamond Evac 7 Snow Shovel',
            spec: 'Anodized Aluminum Blade • Rapid Hoe Conversion Mode',
            status: 'ESSENTIAL',
            weight: '794g',
            weightGrams: 794,
            note: 'Crucial for digging snow trenches, wind baffles, and emergency snow caves.',
            category: 'NAVIGATION & TOOLS'
          },
          {
            id: 'win-8',
            name: 'BCA Stealth 300 Aluminum Probe',
            spec: 'Laser-Etched Depth Markings • Quick-Draw Lock Cable',
            status: 'ESSENTIAL',
            weight: '330g',
            weightGrams: 330,
            note: 'Probing ice thickness on wind-blown lakes and measuring snow depth.',
            category: 'NAVIGATION & TOOLS'
          },
          {
            id: 'win-9',
            name: 'Hultafors Åby Forest Axe',
            spec: 'Hand-Forged Swedish Carbon Steel • 0.7kg Head • Hickory',
            status: 'ESSENTIAL',
            weight: '1,015g',
            weightGrams: 1015,
            note: 'Felling dead dry standing pine spars for sustained sub-zero hearth fires.',
            category: 'NAVIGATION & TOOLS'
          }
        ]
      }
    ]
  },
  {
    id: 'SPRING',
    season: 'SPRING',
    label: 'Spring Thaw',
    title: 'Spring Thaw & High Bog Transit',
    subtitle: 'Melting snowpack, roaring torrents, peat marsh crossings, and rapid mobility',
    tempRange: '2°C to 14°C',
    terrain: 'Saturated sphagnum bogs, meltwater defiles & bare rocky shelves',
    baseWeightKg: 3.85,
    categories: [
      {
        name: 'SHELTER & SLEEP',
        items: [
          {
            id: 'spr-1',
            name: 'Hyperlite Mountain Gear Mid 1',
            spec: 'Dyneema Composite Fabric (DCF) • Single Trekking Pole Pitch',
            status: 'PACKED',
            weight: '476g',
            weightGrams: 476,
            note: 'Ultralight waterproof pyramid shelter; sheds spring gales without water absorption.',
            category: 'SHELTER & SLEEP'
          },
          {
            id: 'spr-2',
            name: 'Cumulus X-Lite 400 Quilt',
            spec: '900 FP Polish Goose Down • Toray Airtastic 19g/m²',
            status: 'PACKED',
            weight: '575g',
            weightGrams: 575,
            note: 'High-loft warmth with open footbox ventilation for variable spring temps.',
            category: 'SHELTER & SLEEP'
          },
          {
            id: 'spr-3',
            name: 'Therm-a-Rest NeoAir XLite NXT',
            spec: 'R-Value 4.5 • 7.6cm Depth • 354g Regular',
            status: 'PACKED',
            weight: '354g',
            weightGrams: 354,
            note: 'Excellent warmth-to-weight ratio for damp ground insulation.',
            category: 'SHELTER & SLEEP'
          }
        ]
      },
      {
        name: 'COOK & WATER',
        items: [
          {
            id: 'spr-4',
            name: 'Evernew Titanium 570FD Mug Pot',
            spec: '0.3mm Ultralight Titanium • Volume Graduations • Lid',
            status: 'PACKED',
            weight: '55g',
            weightGrams: 55,
            note: 'Minimalist vessel for boiling rapid freeze-dried meals and tea.',
            category: 'COOK & WATER'
          },
          {
            id: 'spr-5',
            name: 'BRS-3000T Micro Titanium Burner',
            spec: 'Titanium Alloy • 25g Weight • 2,700W Output',
            status: 'PACKED',
            weight: '25g',
            weightGrams: 25,
            note: 'Compact pocket canister stove for speedy spring break brews.',
            category: 'COOK & WATER'
          },
          {
            id: 'spr-6',
            name: 'Sawyer Squeeze + Cnoc 2.0L TPU Bladder',
            spec: '0.1 Micron Hollow Fiber • 28mm Thread • 2.0L Wide Mouth',
            status: 'PACKED',
            weight: '140g',
            weightGrams: 140,
            note: 'High-volume filtration from rushing spring meltwater torrents.',
            category: 'COOK & WATER'
          }
        ]
      },
      {
        name: 'NAVIGATION & TOOLS',
        items: [
          {
            id: 'spr-7',
            name: 'Silva Field Baseplate Compass',
            spec: 'Scratch-Resistant Acrylic • Declination Scale • Lanyard',
            status: 'ESSENTIAL',
            weight: '28g',
            weightGrams: 28,
            note: 'Featherlight navigational essential for fast topo checks.',
            category: 'NAVIGATION & TOOLS'
          },
          {
            id: 'spr-8',
            name: 'Morakniv Eldris LightDuty',
            spec: 'Swedish Stainless Sandvik 12C27 • Neck Sheath • 59mm Blade',
            status: 'ESSENTIAL',
            weight: '80g',
            weightGrams: 80,
            note: 'Pocket fixed blade for quick cord cutting and food prep.',
            category: 'NAVIGATION & TOOLS'
          }
        ]
      }
    ]
  },
  {
    id: 'SUMMER',
    season: 'SUMMER',
    label: 'Summer Boreal',
    title: 'Summer Boreal & Tarn Packrafting',
    subtitle: 'Midnight sun, lake hopping, pine ridge wild camping, and swimming holes',
    tempRange: '10°C to 24°C',
    terrain: 'Highland tarn chains, dry pine heaths & open granite slabs',
    baseWeightKg: 4.45,
    categories: [
      {
        name: 'SHELTER & SLEEP',
        items: [
          {
            id: 'sum-1',
            name: 'Sea to Summit Escapist 3x3 Tarp',
            spec: '15D Ultra-Sil Nano Sil/PU • 8 Tie-Out Points • 300x300cm',
            status: 'PACKED',
            weight: '350g',
            weightGrams: 350,
            note: 'Bespoke pitch between old Scots pines overlooking peaceful summer waters.',
            category: 'SHELTER & SLEEP'
          },
          {
            id: 'sum-2',
            name: 'Sea to Summit Escapist Bug Mesh',
            spec: 'Ultra-Fine 15D Mesh • Bathtub Floor • Double Zip',
            status: 'PACKED',
            weight: '145g',
            weightGrams: 145,
            note: 'Essential impenetrable fortress against northern mosquitoes and midges.',
            category: 'SHELTER & SLEEP'
          },
          {
            id: 'sum-3',
            name: 'Enlightened Equipment Revelation 40°F',
            spec: '850 FP Down • 10D Ripstop Nylon • Elastic Pad Straps',
            status: 'PACKED',
            weight: '440g',
            weightGrams: 440,
            note: 'Airy summer quilt perfectly suited to mild Nordmarka nights under twilight.',
            category: 'SHELTER & SLEEP'
          }
        ]
      },
      {
        name: 'COOK & WATER',
        items: [
          {
            id: 'sum-4',
            name: 'TOAKS Titanium 750ml Pot',
            spec: 'Titanium • Bail Handle • Mesh Storage Sack',
            status: 'PACKED',
            weight: '110g',
            weightGrams: 110,
            note: 'Can hang directly over open pine hearth coals or sit on a micro stove.',
            category: 'COOK & WATER'
          },
          {
            id: 'sum-5',
            name: 'Platypus GravityWorks 2.0L System',
            spec: 'Gravity Fed • 1.5L/min Flow • Hollow Fiber Cartridge',
            status: 'PACKED',
            weight: '260g',
            weightGrams: 260,
            note: 'Hands-free basecamp filtration while swimming or foraging wild berries.',
            category: 'COOK & WATER'
          }
        ]
      },
      {
        name: 'WATER & MOBILITY',
        items: [
          {
            id: 'sum-6',
            name: 'Alpacka Raft Classic Packraft',
            spec: 'Urethane-Coated Nylon • Cargo Fly Zipper • Removable Seat',
            status: 'READY',
            weight: '2,600g',
            weightGrams: 2600,
            note: 'Unlocks secluded island campsites and uncharted tarn fishing coves.',
            category: 'PACK & APPAREL'
          },
          {
            id: 'sum-7',
            name: 'Aqua-Bound Manta Ray Carbon Paddle',
            spec: '4-Piece Breakdown • Carbon Shaft • abXII Resilient Blades',
            status: 'READY',
            weight: '850g',
            weightGrams: 850,
            note: 'Packs flat against rucksack exterior for trail portages.',
            category: 'PACK & APPAREL'
          }
        ]
      }
    ]
  }
]

export const mockGearInsights: GearInsight[] = [
  {
    id: 'insight-1',
    tag: 'DURABILITY LOG',
    category: 'DURABILITY',
    title: 'Hilleberg Kerlon 1200: 4 Years of Sub-Arctic Pine & Sleet Abrasion',
    date: 'OCT 2026 // FIELD LOG',
    readTime: '4 MIN READ',
    image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
    equipmentTested: 'Hilleberg Akto (Kerlon 1200 30D High-Tenacity Ripstop Nylon)',
    duration: '48 Backcountry Nights Across 4 Seasons',
    summary: 'An exhaustive assessment of siliconized nylon durability under severe northern exposure, constant sap exposure, and gale-force ridge winds.',
    observations: [
      '12 kg tear strength prevents punctures from sharp granite erratics from expanding into catastrophic tears.',
      '100% silicone coating (3 layers per side) retains hydrophobic water beading with zero fluorocarbon DWR breakdown.',
      'Unlike polyurethane (PU) coated fabrics, Kerlon has shown zero sticky hydrolysis or seam tape delamination after repeated damp storage.',
      'Resinous Scots pine sap spots were safely cleaned using pure isopropanol without degrading fabric elasticity.'
    ],
    verdict: 'MECHANICAL INTEGRITY 100% // ZERO SEAM LEAKAGE OR TENSILE DEGRADATION AFTER 4 YEARS OF HARD FIELD USE.',
    telemetry: [
      { label: 'TEAR RESISTANCE', value: '12 KG ISO 13937' },
      { label: 'HYDROSTATIC HEAD', value: '5,000 MM' },
      { label: 'FAILURE COUNT', value: '0 LEAKS' }
    ]
  },
  {
    id: 'insight-2',
    tag: 'THERMAL DYNAMICS',
    category: 'THERMAL',
    title: 'Vapor Pressure Physics: Why Trangia Bio-Ethanol Defeats Canister Gas Below -5°C',
    date: 'SEP 2026 // LAB & FIELD',
    readTime: '5 MIN READ',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    equipmentTested: 'Trangia Brass Spirit Burner vs Isobutane/Propane Canister Stoves',
    duration: 'Sub-Zero Tests from -3°C down to -22°C',
    summary: 'Analyzing boiling telemetry and vaporization thermodynamics in freezing environments.',
    observations: [
      'Isobutane/propane canisters suffer severe pressure collapse when the canister wall temperature drops below the fuel boiling point (-0.5°C for n-butane, -11°C for isobutane).',
      'Denatured bio-ethanol burns by passive liquid wicking; pairing with a Trangia winter preheat pad maintains steady 6.5-minute 1L boil times even at -20°C.',
      'Zero moving valves, O-rings, or pressurized hose junctions to freeze, crack, or leak in sub-zero frost.',
      'Fuel availability is universal across rural Scandinavian grocery stores and timber outposts as "Rødsprit".'
    ],
    verdict: 'LIQUID SPIRIT FUELS RETAIN 100% OPERATIONAL RELIABILITY WHERE GAS CANISTERS SUFFER SYSTEMIC PRESSURE COLLAPSE.',
    telemetry: [
      { label: 'SUB-ZERO BOIL (1L)', value: '6 MIN 40 SEC' },
      { label: 'IGNITION FLOOR', value: '-22°C' },
      { label: 'MOVING VALVES', value: '0 (SOLID BRASS)' }
    ]
  },
  {
    id: 'insight-3',
    tag: 'FIELD REPORT',
    category: 'PHILOSOPHY',
    title: 'The Lundhags Shell Boot System vs Gore-Tex in Norwegian Sphagnum Bogs',
    date: 'AUG 2026 // TAIGA SURVEY',
    readTime: '4 MIN READ',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
    equipmentTested: 'Lundhags Vandra High Unlined Full-Grain Leather Boots',
    duration: '350+ Kilometers Across Wetland Taiga',
    summary: 'Why unlined leather shell boots with dual merino wool liners outperform membrane-lined footwear in boreal wetlands.',
    observations: [
      'Gore-Tex membrane hiking boots inevitably flood over the ankle collar in deep bog defiles and take 72+ hours to dry in damp cold air.',
      'Unlined shell boots possess zero foam insulation to hold water; simply wring out the wool socks, wipe the cellular rubber base with a bandanna, and put on dry spare socks to be 100% dry in 3 minutes.',
      'Certech cellular rubber footbed provides complete barrier against peat acids, standing mire, and sharp dwarf birch roots.',
      'Full leather upper breathes freely through high collar without moisture trap buildup.'
    ],
    verdict: 'MEMBRANES RETAIN MOISTURE INTERNALLY IN DENSE BOGS. A MODULAR UNLINED SHELL BOOT DRIES INSTANTLY AT THE GAPAHUK.',
    telemetry: [
      { label: 'INTERNAL DRY TIME', value: '< 5 MINUTES' },
      { label: 'SUBMERSION RECOVERY', value: 'IMMEDIATE' },
      { label: 'LIFESPAN', value: '10+ YRS (RESOLEABLE)' }
    ]
  },
  {
    id: 'insight-4',
    tag: 'THERMAL DYNAMICS',
    category: 'THERMAL',
    title: 'Sub-Arctic Sleep Conduction: Why Pad R-Value Outranks Sleeping Bag Loft',
    date: 'JUL 2026 // FIELD LOG',
    readTime: '4 MIN READ',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    equipmentTested: 'Therm-a-Rest NeoAir XTherm NXT (R-7.3) on Bare Glacial Granite',
    duration: '18 Frozen Ground Nights (0°C to -15°C)',
    summary: 'Quantitative heat transfer analysis demonstrating that ground conductive cooling accounts for up to 60% of sleep heat loss.',
    observations: [
      'Under body weight, down and synthetic sleeping bag insulation compresses to ~3mm underneath the sleeper, dropping thermal resistance below R-0.5.',
      'Without an R-6.0+ thermal barrier, core body heat conductively bleeds directly into the heat sink of frozen bedrock or permafrost.',
      'Reflective ThermaCapture triangular core matrix reflects infrared radiant heat back to the body while trapping convective air pockets.',
      'A 7.6cm loft prevents hip bone contact with uneven granite erratics, maintaining continuous insulation.'
    ],
    verdict: 'NEVER UPGRADE A SLEEPING BAG BEFORE SECURING AN R-7.0+ THERMAL PAD BARRIER ON BOREAL ROCK.',
    telemetry: [
      { label: 'CONDUCTION LOSS CUT', value: '88%' },
      { label: 'ASTM R-VALUE', value: '7.3 RATING' },
      { label: 'THICKNESS', value: '7.6 CM' }
    ]
  },
  {
    id: 'insight-5',
    tag: 'MAINTENANCE LOG',
    category: 'MAINTENANCE',
    title: 'Carbon Steel in Humid Taiga: The Forced Birch Vinegar Patina Protocol',
    date: 'JUN 2026 // FORGE & FIELD',
    readTime: '3 MIN READ',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    equipmentTested: 'Morakniv Garberg High-Carbon (3.2mm Swedish Carbon Steel)',
    duration: '24 Months Continuous Taiga Field Use',
    summary: 'Chemical surface passivation technique to prevent destructive red rust (Fe2O3) in high-humidity boreal moss stands.',
    observations: [
      'Polished high-carbon steel rusts within 3 hours when exposed to acidic bilberry juices and damp sphagnum moss.',
      'Immersion in heated apple cider vinegar and crushed birch polypore mushroom liquor converts the active iron surface into dark magnetite (Fe3O4 black oxide).',
      'Black oxide patina holds mineral oil film 4x longer than bare ground steel, allowing heavy log splitting with zero flaking.',
      'Scandi-grind edge is maintained on an Arkansas fine oil stone in under 2 minutes.'
    ],
    verdict: 'FORCED MAGNETITE PATINA NEUTRALIZES OXIDATION WHILE MAINTAINING SURGICAL SCANDI-GRIND BARK SHAVING EDGES.',
    telemetry: [
      { label: 'CORROSION RESISTANCE', value: '400% INCREASE' },
      { label: 'BLADE HARDNESS', value: 'HRC 58-60' },
      { label: 'BEVEL PROFILE', value: '27° SCANDI' }
    ]
  },
  {
    id: 'insight-6',
    tag: 'FIELD DISPATCH',
    category: 'MAINTENANCE',
    title: 'The 85-Gram Field Repair Manifest: Equipment Self-Sufficiency',
    date: 'MAY 2026 // PACK REVIEW',
    readTime: '3 MIN READ',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    equipmentTested: 'Modular Backcountry Repair Kit in Tyvek Pouch',
    duration: 'Deployed on 7 Multi-Day Expeditions',
    summary: 'Minimalist failure recovery kit capable of repairing tents, pulks, ski bindings, and pack harnesses in isolated wilderness sectors.',
    observations: [
      '1 meter of Tenacious Tape rolled around a Bic lighter seals torn silnylon, cracked water bladders, and punctured sleeping pads instantly.',
      'A #4 curved sailmaker’s needle + 5m Kevlar thread repairs torn pack suspension webbing under 40kg dynamic load.',
      '1.5m copper snare wire fixes broken snowshoe hinges, stove pot supports, or ski poles when screws shear in extreme cold.',
      'Small tube of Seam Grip + alcohol prep pads handles vulcanized rubber boot repairs overnight beside the hearth.'
    ],
    verdict: 'SELF-RESCUE REQUIRES MECHANICAL HARDWARE, NOT SPARE ELECTRONICS. WEIGHT COST IS NEGLIGIBLE AT 85 GRAMS.',
    telemetry: [
      { label: 'TOTAL POUCH WEIGHT', value: '85 GRAMS' },
      { label: 'FAILURES RESOLVED', value: '4 IN FIELD' },
      { label: 'PACK VOLUME', value: '< 150 ML' }
    ]
  }
]
