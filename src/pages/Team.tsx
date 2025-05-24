import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const teamMembers = [
  { name: 'Akhlaq', role: 'Assistant Vice President', img: '/images/team/akhlaq.png' },
  { name: 'Brent', role: 'Product & Engineering Builder', img: '/images/team/brent.png' },
  { name: 'Lynnette', role: 'Developer', img: 'https://randomuser.me/api/portraits/women/34.jpg' },
  { name: 'Cliff', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/35.jpg' },
  { name: 'Mark', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/36.jpg' },
];

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-4xl flex justify-start mb-6">
        <Link to="/">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 font-fredoka text-lg"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back to Home
          </Button>
        </Link>
      </div>
      <h1 className="font-bubblegum text-5xl font-bold text-white mb-10 drop-shadow-lg">Meet the Team</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <Card key={member.name} className="w-72 bg-white/90 shadow-xl hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={member.img} alt={member.name} className="object-cover aspect-square" />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-center">{member.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-lg text-gray-700 font-fredoka">{member.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 