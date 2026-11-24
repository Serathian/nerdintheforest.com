export const ETHOS_HERO_IMAGE =
  'https://basecamp-hot.fra1.cdn.digitaloceanspaces.com/nitf_media/seitsemisen-me-2025.jpg'

export interface EthosRule {
  tag: string
  text: string
}

export interface EthosPrinciple {
  id: string
  number: string
  title: string
  subtitle: string
  summary: string
  rules: EthosRule[]
}

export interface EthosTelemetryInput {
  dispatchCount: number
  waypointCount: number
  cmsError?: string | null
}

export interface EthosTelemetry {
  dispatchesLabel: string
  waypointsLabel: string
  isOffline: boolean
}

export const ETHOS_PRINCIPLES: EthosPrinciple[] = [
  {
    id: 'why-i-map',
    number: '01',
    title: 'Why I Map',
    subtitle: 'PUBLIC INFRASTRUCTURE & WILD-CAMPING ETHOS',
    summary:
      'Curated, reliable details on trailheads, shelters, and rest spots are often scattered or out of date. I map shared infrastructure like laavu lean-tos, cabins, forest kitchens, and hearths—so those places are easy to find and plan around. I use the dispatches to share the ethos of the outdoors and what those nights in the woods actually feel like. Follow my journey, and I hope you get inspired to step away from the screen too.',
    rules: [
      {
        tag: 'PUBLIC SPOTS',
        text: 'Pin marked shelters, hearths, springs, and trailheads that are meant to be shared.'
      },
      {
        tag: 'QUIET CAMPS',
        text: 'Keep off-trail wild-camp spots unmarked so quiet corners stay that way.'
      },
      {
        tag: 'WILD CAMPING',
        text: 'Share the mindset and real atmosphere of respectful, low-trace nights away from established sites.'
      }
    ]
  },
  {
    id: 'honest-gear',
    number: '02',
    title: 'Honest Gear Notes',
    subtitle: 'BALANCING WEIGHT, WEATHER & COMFORT',
    summary:
      'Heading into the forest isn’t always about chasing ultralight minimalism or hauling basecamp comfort. For me, it’s about finding the right balance for the goal: I enjoy long-distance hikes with a pared-back pack just as much as pulling up in the car to make cheese fondue. Either way, the gear locker sticks to honest gear insights and realistic loadouts tested through wet autumns and sub-zero cold.',
    rules: [
      {
        tag: 'GOAL FIRST',
        text: 'Pack light when distance matters; bring heavier comforts when food and a slower evening are the goal.'
      },
      {
        tag: 'REAL LOADOUTS',
        text: 'Log actual carried weights and full packing lists rather than idealized shelf specs.'
      },
      {
        tag: 'COLD & WET',
        text: 'Judge equipment on how it handles rain, condensation, frost, and dark Nordic evenings.'
      }
    ]
  },
  {
    id: 'unhurried-time',
    number: '03',
    title: 'Unhurried Field Time',
    subtitle: 'FOUR SEASONS, NO RUSH',
    summary:
      'Good trips aren’t measured in peak counts or pace splits. Whether it’s a multi-day trek between timber shelters, pitching a solo tent in winter snow, or simply parking near the woods for the evening, the aim is stepping away from the screen. Sitting by the stone hearth with a coffee, a stout, and a good selection of cheeses beats rushing for another summit.',
    rules: [
      {
        tag: 'ALL SEASONS',
        text: 'Get out through autumn mud, shoulder-season frost, and winter snow.'
      },
      {
        tag: 'NO ITINERARY',
        text: 'Leave room to stop early, read the weather, and linger around a warm fire.'
      },
      {
        tag: 'PROVISIONS',
        text: 'Coffee with milk at dawn; fondue, good cheese, and a stout once camp is set.'
      }
    ]
  },
  {
    id: 'leaving-better',
    number: '04',
    title: 'Leaving Woods Better Than Found',
    subtitle: 'JOKAISENOIKEUS, ALLEMANNSRETTEN & SHELTER CARE',
    summary:
      'The Nordic freedom to roam—whether Finnish Jokaisenoikeus or Norwegian and Swedish Allemannsretten—only holds up when people care for the land and shared huts. Every outing closes with the same habits: packing every scrap back out, honoring fire warnings and privacy around cabins, and leaving shelters swept and stocked for whoever walks in cold next.',
    rules: [
      {
        tag: 'EVERYMAN’S RIGHT',
        text: 'Roam freely across forest and fell while giving inhabited cabins and wildlife wide berth.'
      },
      {
        tag: 'SHELTER CARE',
        text: 'Sweep the floor, restock split kindling and dry birch bark, and leave huts ready for the next hiker.'
      },
      {
        tag: 'TRACE FREE',
        text: 'Respect active fire bans, drown embers dead cold, and carry out everything brought in.'
      }
    ]
  }
]

/**
 * Formats live CMS dispatch and waypoint counts for the Ethos telemetry bar
 * without falling back to synthetic mock totals when Basecamp CMS is offline.
 */
export function getEthosTelemetry(input: EthosTelemetryInput): EthosTelemetry {
  const hasError = Boolean(input.cmsError)
  const dispatchesMissing = hasError && input.dispatchCount <= 0
  const waypointsMissing = hasError && input.waypointCount <= 0

  return {
    dispatchesLabel: dispatchesMissing ? '—' : String(Math.max(0, input.dispatchCount)),
    waypointsLabel: waypointsMissing ? '—' : String(Math.max(0, input.waypointCount)),
    isOffline: hasError && (input.dispatchCount <= 0 || input.waypointCount <= 0)
  }
}
