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

  it('hasRole() returns true when user role meets or exceeds required role', () => {
    expect(hasRole('admin', 'user')).toBe(true)
    expect(hasRole('manager', 'artist')).toBe(true)
    expect(hasRole('artist', 'artist')).toBe(true)
    expect(hasRole('artist', 'manager')).toBe(false)
    expect(hasRole('user', 'admin')).toBe(false)
  })

  it('hasRole() handles undefined roles gracefully', () => {
    expect(hasRole(undefined, 'user')).toBe(false)
    expect(hasRole('admin', undefined)).toBe(false)
  })
})
