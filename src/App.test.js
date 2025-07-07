import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';
import { FirebaseContext } from './contexts/FirebaseContext';

function renderWithContext(ui, { currentUser, userRole, loading = false }) {
  return render(
    <FirebaseContext.Provider value={{
      currentUser,
      userRole,
      loading,
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithGoogleRedirect: jest.fn(),
      createTicket: jest.fn(),
      getUserTickets: jest.fn(),
      getAllTickets: jest.fn(),
      updateTicketStatus: jest.fn(),
      uploadFile: jest.fn(),
      getUserProfile: jest.fn(),
      isOnline: true,
      listenToUserTickets: jest.fn(),
      listenToAllTickets: jest.fn(),
      assignTicket: jest.fn(),
      addCommentToTicket: jest.fn(),
      getAllUsers: jest.fn(),
    }}>
      <MemoryRouter initialEntries={["/admin"]}>{ui}</MemoryRouter>
    </FirebaseContext.Provider>
  );
}

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('non-admins are redirected from /admin', () => {
  renderWithContext(<App />, { currentUser: { uid: '1' }, userRole: 'user' });
  expect(screen.queryByText(/Admin Panel/i)).not.toBeInTheDocument();
});

test('admins can access /admin', () => {
  renderWithContext(<App />, { currentUser: { uid: '1' }, userRole: 'admin' });
  expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
});

test('admin link only visible for admins', () => {
  // For admin
  renderWithContext(<App />, { currentUser: { uid: '1' }, userRole: 'admin' });
  expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
  // For user
  renderWithContext(<App />, { currentUser: { uid: '2' }, userRole: 'user' });
  expect(screen.queryByText(/Admin Panel/i)).not.toBeInTheDocument();
});
