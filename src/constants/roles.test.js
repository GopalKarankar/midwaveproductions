import { ROLES, ROLE_HIERARCHY, hasRole } from '@/constants/roles'

describe('Roles', () => {
  it('ROLES object contains expected keys', () => {
    expect(ROLES.USER).toBe('user')
    expect(ROLES.ARTIST).toBe('artist')
    expect(ROLES.MANAGER).toBe('manager')
    expect(ROLES.ADMIN).toBe('admin')
  })

  it('ROLE_HIERARCHY defines correct numeric levels', () => {
    expect(ROLE_HIERARCHY.user).toBe(0)
    expect(ROLE_HIERARCHY.artist).toBe(1)
    expect(ROLE_HIERARCHY.manager).toBe(2)
    expect(ROLE_HIERARCHY.admin).toBe(3)
  })

  it('hasRole() uses the highest role in the array', () => {
    expect(hasRole(['admin'], 'user')).toBe(true)
    expect(hasRole(['artist', 'manager'], 'artist')).toBe(true)
    expect(hasRole(['artist', 'manager'], 'admin')).toBe(false)
    expect(hasRole(['artist'], 'manager')).toBe(false)
    expect(hasRole(['user'], 'admin')).toBe(false)
  })

  it('hasRole() treats multiple independent roles as cumulative for threshold checks', () => {
    expect(hasRole(['artist', 'manager'], 'manager')).toBe(true)
  })

  it('hasRole() handles empty/undefined/non-array input gracefully', () => {
    expect(hasRole(undefined, 'user')).toBe(false)
    expect(hasRole([], 'user')).toBe(false)
    expect(hasRole(['admin'], undefined)).toBe(false)
  })
})
