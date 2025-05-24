import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const teamMembers = [
  { name: 'Akhlaq', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Brent', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/33.jpg' },
  { name: 'Lynnette', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/34.jpg' },
  { name: 'Cliff', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/35.jpg' },
  { name: 'Mark', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/36.jpg' },
];

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex flex-col items-center justify-center py-12">
      <h1 className="font-bubblegum text-5xl font-bold text-white mb-10 drop-shadow-lg">Meet the Team</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <Card key={member.name} className="w-72 bg-white/90 shadow-xl hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={member.img} alt={member.name} />
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