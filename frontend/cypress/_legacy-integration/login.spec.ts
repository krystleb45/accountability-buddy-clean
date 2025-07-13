describe('Login Flow', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/login');
  });

  it('displays the login form', () => {
    // Check if email and password fields are present
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');

    // Check if login button is present
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('shows error messages for empty form submission', () => {
    // Click the login button without filling the form
    cy.get('button[type="submit"]').click();

    // Check if error messages are displayed
    cy.contains('Please fill in all fields').should('be.visible');
  });

  it('shows error message for invalid email format', () => {
    // Enter an invalid email and a valid password
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Check if error message for invalid email is shown
    cy.contains('Invalid email format').should('be.visible');
  });

  it('logs in successfully with valid credentials', () => {
    // Enter valid email and password
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Check if the user is redirected to the dashboard
    cy.url().should('include', '/dashboard');
  });

  it('shows error for invalid login credentials', () => {
    // Enter invalid email and password
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Check if an error message for invalid credentials is displayed
    cy.contains('Invalid email or password').should('be.visible');
  });

  it('keeps the user logged in after page refresh', () => {
    // Enter valid email and password
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Check if the user is redirected to the dashboard
    cy.url().should('include', '/dashboard');

    // Refresh the page
    cy.reload();

    // Check if the user remains on the dashboard
    cy.url().should('include', '/dashboard');
  });
});
