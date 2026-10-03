import { FaGithub } from 'react-icons/fa';
import team from '../data/team';

const Team = () => (
  <div>
    <p className="eyebrow">Team</p>
    <h1 className="mt-1 text-3xl font-semibold">The people behind AdVise</h1>
    <p className="mt-2 max-w-2xl text-muted">
      AdVise started at the Level SuperMind hackathon in January 2025, built by four of us over a weekend.
    </p>

    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {team.map((member) => (
        <li key={member.name} className="card overflow-hidden">
          <img src={member.photo} alt={member.name} className="aspect-square w-full object-cover" loading="lazy" />
          <div className="flex items-center justify-between gap-2 p-4">
            <p className="font-semibold">{member.name}</p>
            <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on GitHub`} className="text-muted hover:text-accent">
              <FaGithub size={18} />
            </a>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default Team;
