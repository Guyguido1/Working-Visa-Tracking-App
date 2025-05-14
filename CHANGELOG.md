# 📦 Changelog

All notable changes to this project are documented here.

## [1.1.0] – 2025-05-14
### Added
- Session management improvements:
  - Changed session expiry from 7 days to 12 hours to align with office hours
    - Implemented database structure for session management
  - Added foundation for single session per user functionality

### Changed
- Login process now creates sessions with 12-hour expiry instead of 7 days
- Session cookie now expires after 12 hours to match database session expiry

## [1.0.0] – 2025-05-13
### Added
- Company and admin user registration flow
- Multi-tenant architecture with company isolation
- Session structure includes `company_id`, `is_admin`, `role`
- Tenant-scoped views: users and customers filtered by company
- Dashboard with key metrics and customer categorization
- Customer management with detailed profiles
- User management for company administrators
- File upload functionality for customer documents
- Notes section for customer interactions
- Calendar view for important dates
- Dark mode support
- UK-style date format (dd/MM/yyyy)
- Add User and Add Customer forms use session's `company_id`
- Error logging added to all major server actions
- Birthday notifications for customers with birthdays today or tomorrow

### Fixed
- React Error #31 caused by rendering raw objects in JSX
- `NEXT_REDIRECT` crashes from invalid `redirect()` calls inside actions
- Silent insert failures due to missing session or `company_id`
- Date format inconsistencies across the application
- Calendar background color in dark mode
- Birthday filter completely replaced with exact day/month matching for today and tomorrow only
- Dashboard UI updated to show "Today & Tomorrow's Birthdays" instead of generic "Birthdays" title

### Cleaned
- Removed temporary `console.log()` and debug statements
- Simplified `catch` blocks to return consistent `{ success, name }` responses
- Standardized error handling across all server actions
- Improved code organization and file structure
