// Frontend Tests - React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });

  it('displays header', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Arbre Généalogique/i)).toBeInTheDocument();
  });

  it('displays add person button', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Ajouter une personne/i)).toBeInTheDocument();
  });

  it('displays search input', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText(/Rechercher/i)).toBeInTheDocument();
  });

  it('navigates to create page', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const addButton = screen.getByText(/Ajouter une personne/i);
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Prénom/i)).toBeInTheDocument();
    });
  });
});
