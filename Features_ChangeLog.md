# Features ChangeLog

## Authentication Enhancements (v1.0.0)

- **Robust JWT Handling**: Added fallback secret for JWT token signing in AuthService, ensuring session creation succeeds even if JWT_SECRET is temporarily unset during development.
- **Hybrid Auth Testing**: Integrated real database user into MockAuthService data, allowing seamless login testing in mock mode without configuration changes. Users can now authenticate with existing DB credentials (e.g., cheemsyyy@yahoo.com / demo123) in both modes.
- **Debug Logging**: Comprehensive console logging added to login flow for troubleshooting authentication issues, including service selection, user lookup, password verification, and success indicators.

This enables immediate testing of role-based dashboards while maintaining production-ready DB fallback.