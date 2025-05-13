# 📦 Changelog

All notable changes to this project are documented here.

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
- Birthday filter updated to show only today and tomorrow

### Cleaned
- Removed temporary `console.log()` and debug statements
- Simplified `catch` blocks to return consistent `{ success, name }` responses
- Standardized error handling across all server actions
- Improved code organization and file structure
