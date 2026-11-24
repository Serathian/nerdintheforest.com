import { describe, it, expect } from 'vitest'
import { ETHOS_HERO_IMAGE, ETHOS_PRINCIPLES, getEthosTelemetry } from '../../utils/ethos'

describe('Ethos Page Data & Telemetry (/ethos)', () => {
  it('uses the Seitseminen hero image and defines 4 personal principles', () => {
    expect(ETHOS_HERO_IMAGE).toBe(
      'https://basecamp-hot.fra1.cdn.digitaloceanspaces.com/nitf_media/seitsemisen-me-2025.jpg'
    )
    expect(ETHOS_PRINCIPLES).toHaveLength(4)
    expect(ETHOS_PRINCIPLES.map(p => p.title)).toEqual([
      'Why I Map',
      'Honest Gear Notes',
      'Unhurried Field Time',
      'Leaving Woods Better Than Found'
    ])

    const allCopy = ETHOS_PRINCIPLES.map(p => `${p.title} ${p.subtitle} ${p.summary} ${p.rules.map(r => r.text).join(' ')}`).join(' ')
    expect(allCopy).toContain('Jokaisenoikeus')
    expect(allCopy).toContain('Allemannsretten')
    expect(allCopy.toLowerCase()).toContain('coffee with milk')
    expect(allCopy).toContain('cheese fondue')
    expect(allCopy).toContain('selection of cheeses')
    expect(allCopy).toContain('stout')
    expect(allCopy).not.toContain('stone heart ')
    expect(allCopy).not.toContain('Nordmarka')
    expect(allCopy).not.toContain('1957')
    expect(allCopy).not.toContain('tent loops')
    expect(allCopy).not.toContain('black coffee')
  })

  it('formats live CMS telemetry when connected', () => {
    expect(
      getEthosTelemetry({ dispatchCount: 5, waypointCount: 12, cmsError: null })
    ).toEqual({
      dispatchesLabel: '5',
      waypointsLabel: '12',
      isOffline: false
    })

    expect(
      getEthosTelemetry({ dispatchCount: 0, waypointCount: 0, cmsError: null })
    ).toEqual({
      dispatchesLabel: '0',
      waypointsLabel: '0',
      isOffline: false
    })
  })

  it('shows dash placeholders and offline flag when CMS is unreachable', () => {
    expect(
      getEthosTelemetry({
        dispatchCount: 0,
        waypointCount: 0,
        cmsError: 'Could not fetch dispatches from CMS'
      })
    ).toEqual({
      dispatchesLabel: '—',
      waypointsLabel: '—',
      isOffline: true
    })

    expect(
      getEthosTelemetry({
        dispatchCount: 3,
        waypointCount: 0,
        cmsError: 'Could not fetch locations from CMS'
      })
    ).toEqual({
      dispatchesLabel: '3',
      waypointsLabel: '—',
      isOffline: true
    })
  })
})
