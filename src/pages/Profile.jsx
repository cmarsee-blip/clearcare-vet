import ClientDashboard from './profile/ClientDashboard'
import VetDashboard from './profile/VetDashboard'
import ClinicDashboard from './profile/ClinicDashboard'
import AdminDashboard from './profile/AdminDashboard'
import { useStore } from '../context/StoreContext'

const roleLabel = { client: 'Animal owner account', vet: 'Veterinarian account', clinic: 'Clinic account', admin: 'Site admin account' }

// One /profile route. What it shows depends on the logged-in user's role.
export default function Profile() {
  const { user } = useStore()
  const Dashboard = { client: ClientDashboard, vet: VetDashboard, clinic: ClinicDashboard, admin: AdminDashboard }[user.role]

  return (
    <div className="container profile-page">
      <header className="profile-head">
        <h1>{user.name}</h1>
        <p className="muted">{roleLabel[user.role]}</p>
      </header>
      <Dashboard />
    </div>
  )
}
