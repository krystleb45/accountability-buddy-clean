import React from 'react';
import { mount } from 'cypress/react'; // ✅ Import `mount` correctly
import Navbar from '../../src/components/Navbar/Navbar';

describe('<Navbar />', () => {
  it('renders the Navbar component', () => {
    mount(<Navbar />); // ✅ Use `mount` directly

    // Verify the Navbar contains key elements
    cy.get('nav').should('be.visible');
    cy.contains('Home').should('exist');
    cy.contains('About').should('exist');
  });
});
