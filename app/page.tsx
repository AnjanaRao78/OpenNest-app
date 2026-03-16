import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Open-Nest App</h1>

      <div className="space-y-3">
        <Link href="/family" className="block underline">
          Family Group
        </Link>

         <Link href="/reflection" className="block underline">
          Reflection
        </Link>
        
        <Link href="/feed" className="block underline">
          Feed
        </Link>
     
        <Link href="/studies" className="block underline">
          Studies
        </Link>
        <Link href="/reading" className="block underline">
          Reading
        </Link>
        <Link href="/hobbies" className="block underline">
          Hobbies
        </Link>
        <Link href="/internship" className="block underline">
          Internship
        </Link>
      </div>
    </div>
  );
}