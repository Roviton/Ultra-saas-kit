/**
 * Clerk Authentication Verification Script
 * 
 * This script checks the Clerk authentication configuration and provides
 * guidance on fixing any issues found. Run this script to verify that
 * your Clerk authentication setup is correctly configured.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}=== Clerk Authentication Verification ===\n${colors.reset}`);

// Check environment variables
function checkEnvironmentVariables() {
  console.log(`${colors.bold}Checking environment variables...${colors.reset}`);
  
  const envFiles = [
    { name: '.env.development', required: true },
    { name: '.env.production', required: true },
    { name: '.env.local', required: false }
  ];
  
  const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'CLERK_API_URL',
    'CLERK_API_VERSION',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL'
  ];
  
  const optionalVars = [
    'NEXT_PUBLIC_CLERK_JS_ENABLED',
    'NEXT_PUBLIC_CLERK_CORS_ALLOWED_ORIGINS',
    'NEXT_PUBLIC_CLERK_WEBHOOK_VERIFICATION_ENABLED'
  ];
  
  let allValid = true;
  
  envFiles.forEach(({ name, required }) => {
    const filePath = path.join(process.cwd(), name);
    
    if (!fs.existsSync(filePath)) {
      if (required) {
        console.log(`${colors.red}✗ Missing required file: ${name}${colors.reset}`);
        allValid = false;
      } else {
        console.log(`${colors.yellow}⚠ Optional file not found: ${name}${colors.reset}`);
      }
      return;
    }
    
    console.log(`\n${colors.cyan}Checking ${name}:${colors.reset}`);
    const envContent = fs.readFileSync(filePath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const [, key, value] = match;
          envVars[key.trim()] = value.trim();
        }
      }
    });
    
    requiredVars.forEach(varName => {
      if (!envVars[varName]) {
        console.log(`${colors.red}✗ Missing required variable: ${varName}${colors.reset}`);
        allValid = false;
      } else if (envVars[varName].includes('your_') || envVars[varName].includes('placeholder')) {
        console.log(`${colors.red}✗ Variable contains placeholder value: ${varName}=${envVars[varName]}${colors.reset}`);
        allValid = false;
      } else {
        console.log(`${colors.green}✓ ${varName}${colors.reset}`);
      }
    });
    
    optionalVars.forEach(varName => {
      if (!envVars[varName]) {
        console.log(`${colors.yellow}⚠ Optional variable not set: ${varName}${colors.reset}`);
      } else {
        console.log(`${colors.green}✓ ${varName}${colors.reset}`);
      }
    });
  });
  
  if (allValid) {
    console.log(`\n${colors.green}✓ All required environment variables are set correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}✗ Some environment variables are missing or contain placeholder values.${colors.reset}`);
    console.log(`${colors.yellow}  Please update them with actual values from your Clerk dashboard.${colors.reset}`);
  }
  
  return allValid;
}

// Check Clerk package version
function checkClerkPackageVersion() {
  console.log(`\n${colors.bold}Checking Clerk package version...${colors.reset}`);
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const clerkVersion = packageJson.dependencies['@clerk/nextjs'];
    
    if (!clerkVersion) {
      console.log(`${colors.red}✗ @clerk/nextjs package not found in dependencies${colors.reset}`);
      return false;
    }
    
    console.log(`${colors.green}✓ @clerk/nextjs version: ${clerkVersion}${colors.reset}`);
    
    // Check for latest version (this is a simple check, not comprehensive)
    if (clerkVersion.startsWith('^') && parseInt(clerkVersion.substring(1)) < 6) {
      console.log(`${colors.yellow}⚠ You may be using an older version of Clerk. Latest major version is v6+${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Error reading package.json: ${error.message}${colors.reset}`);
    return false;
  }
}

// Check auth routes
function checkAuthRoutes() {
  console.log(`\n${colors.bold}Checking auth routes...${colors.reset}`);
  
  // Check for either standard routes or catch-all routes
  const possibleRoutes = [
    // Standard routes
    { path: 'src/app/auth/sign-in/page.tsx', type: 'standard' },
    { path: 'src/app/auth/sign-up/page.tsx', type: 'standard' },
    // Catch-all routes
    { path: 'src/app/auth/sign-in/[[...sign-in]]/page.tsx', type: 'catch-all' },
    { path: 'src/app/auth/sign-up/[[...sign-up]]/page.tsx', type: 'catch-all' }
  ];
  
  // Group routes by their purpose
  const routeGroups = {
    'sign-in': [
      'src/app/auth/sign-in/page.tsx',
      'src/app/auth/sign-in/[[...sign-in]]/page.tsx'
    ],
    'sign-up': [
      'src/app/auth/sign-up/page.tsx',
      'src/app/auth/sign-up/[[...sign-up]]/page.tsx'
    ]
  };
  
  let allValid = true;
  
  // Check if at least one route from each group exists
  Object.entries(routeGroups).forEach(([purpose, routes]) => {
    const existingRoutes = routes.filter(route => fs.existsSync(path.join(process.cwd(), route)));
    
    if (existingRoutes.length === 0) {
      console.log(`${colors.red}✗ Missing all ${purpose} route files. Need at least one of: ${routes.join(' or ')}${colors.reset}`);
      allValid = false;
      return;
    }
    
    // Verify the content of the existing routes
    existingRoutes.forEach(route => {
      const filePath = path.join(process.cwd(), route);
      const content = fs.readFileSync(filePath, 'utf8');
      const expectedView = purpose; // 'sign-in' or 'sign-up'
      
      if (!content.includes('import AuthPage') || !content.includes(`view="${expectedView}"`)) {
        console.log(`${colors.red}✗ ${route} does not correctly render AuthPage with view='${expectedView}'${colors.reset}`);
        allValid = false;
      } else {
        // For catch-all routes, check if they use hash routing
        if (route.includes('[[...') && !content.includes('routing="hash"')) {
          console.log(`${colors.yellow}⚠ ${route} should use hash routing for Clerk catch-all routes${colors.reset}`);
        }
        console.log(`${colors.green}✓ ${route}${colors.reset}`);
      }
    });
  });
  
  // Check for potential route conflicts
  Object.values(routeGroups).forEach(routes => {
    if (routes.every(route => fs.existsSync(path.join(process.cwd(), route)))) {
      console.log(`${colors.yellow}⚠ Both standard and catch-all routes exist for the same path. This may cause conflicts.${colors.reset}`);
    }
  });
  
  if (allValid) {
    console.log(`${colors.green}✓ All auth routes are correctly configured.${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Some auth routes are missing or incorrectly configured.${colors.reset}`);
  }
  
  return allValid;
}

// Check middleware configuration
function checkMiddleware() {
  console.log(`\n${colors.bold}Checking middleware configuration...${colors.reset}`);
  
  const middlewarePath = path.join(process.cwd(), 'src/middleware.ts');
  
  if (!fs.existsSync(middlewarePath)) {
    console.log(`${colors.red}✗ Middleware file not found${colors.reset}`);
    return false;
  }
  
  const content = fs.readFileSync(middlewarePath, 'utf8');
  
  // Check for Clerk middleware
  if (!content.includes('clerkMiddleware')) {
    console.log(`${colors.red}✗ Clerk middleware not found in middleware.ts${colors.reset}`);
    return false;
  }
  
  // Check for public routes
  const hasPublicRoutes = content.includes('/auth/sign-in') && content.includes('/auth/sign-up');
  
  if (!hasPublicRoutes) {
    console.log(`${colors.red}✗ Auth routes not found in public routes array${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.green}✓ Middleware is correctly configured with Clerk and public routes.${colors.reset}`);
  return true;
}

// Check for custom Clerk client
function checkClerkClient() {
  console.log(`\n${colors.bold}Checking for custom Clerk client...${colors.reset}`);
  
  const clerkClientPath = path.join(process.cwd(), 'src/lib/clerk-client.ts');
  
  if (!fs.existsSync(clerkClientPath)) {
    console.log(`${colors.yellow}⚠ Custom Clerk client not found (src/lib/clerk-client.ts)${colors.reset}`);
    console.log(`${colors.yellow}  This is optional but recommended for centralizing Clerk configuration.${colors.reset}`);
    return true;
  }
  
  console.log(`${colors.green}✓ Custom Clerk client found.${colors.reset}`);
  return true;
}

// Check for shared appearance settings
function checkAppearanceSettings() {
  console.log(`\n${colors.bold}Checking for shared Clerk appearance settings...${colors.reset}`);
  
  const appearancePath = path.join(process.cwd(), 'src/lib/clerk-appearance.ts');
  
  if (!fs.existsSync(appearancePath)) {
    console.log(`${colors.yellow}⚠ Shared Clerk appearance settings not found (src/lib/clerk-appearance.ts)${colors.reset}`);
    console.log(`${colors.yellow}  This is optional but recommended for consistent styling.${colors.reset}`);
    return true;
  }
  
  console.log(`${colors.green}✓ Shared Clerk appearance settings found.${colors.reset}`);
  
  // Check if the appearance settings are imported in auth components
  const authFormPath = path.join(process.cwd(), 'src/components/auth/AuthForm.tsx');
  const authProvidersPath = path.join(process.cwd(), 'src/providers/auth-providers.tsx');
  
  let usedInAuthForm = false;
  let usedInAuthProviders = false;
  
  if (fs.existsSync(authFormPath)) {
    const content = fs.readFileSync(authFormPath, 'utf8');
    usedInAuthForm = content.includes('clerk-appearance') && content.includes('clerkAppearance');
  }
  
  if (fs.existsSync(authProvidersPath)) {
    const content = fs.readFileSync(authProvidersPath, 'utf8');
    usedInAuthProviders = content.includes('clerk-appearance') && content.includes('clerkAppearance');
  }
  
  if (usedInAuthForm) {
    console.log(`${colors.green}✓ Appearance settings used in AuthForm${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Appearance settings not used in AuthForm${colors.reset}`);
  }
  
  if (usedInAuthProviders) {
    console.log(`${colors.green}✓ Appearance settings used in AuthProviders${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Appearance settings not used in AuthProviders${colors.reset}`);
  }
  
  return true;
}

// Run all checks
function runAllChecks() {
  const envVarsValid = checkEnvironmentVariables();
  const packageVersionValid = checkClerkPackageVersion();
  const authRoutesValid = checkAuthRoutes();
  const middlewareValid = checkMiddleware();
  checkClerkClient();
  checkAppearanceSettings();
  
  console.log(`\n${colors.bold}${colors.blue}=== Verification Summary ===\n${colors.reset}`);
  
  if (envVarsValid && packageVersionValid && authRoutesValid && middlewareValid) {
    console.log(`${colors.bold}${colors.green}✓ All critical Clerk authentication components are correctly configured.${colors.reset}`);
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`1. Run the development server: ${colors.bold}npm run dev${colors.reset}`);
    console.log(`2. Test sign-in and sign-up flows in your browser`);
    console.log(`3. Check browser console for any Clerk-related errors`);
    console.log(`4. Verify email verification flow works correctly`);
    console.log(`5. Deploy to production and test in the live environment`);
  } else {
    console.log(`${colors.bold}${colors.red}✗ Some issues were found with your Clerk authentication setup.${colors.reset}`);
    console.log(`\n${colors.cyan}Please fix the issues mentioned above and run this verification script again.${colors.reset}`);
  }
}

// Execute all checks
runAllChecks();
