import AuthCard from '../components/AuthCard';
import Button from '../components/Button';

const NotFound = () => (
  <AuthCard title="Page not found" subtitle="The address may be mistyped, or the page may have moved.">
    <Button to="/" className="w-full">Back to the start</Button>
  </AuthCard>
);

export default NotFound;
