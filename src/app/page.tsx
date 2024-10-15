import { redirect } from 'next/navigation'

// TODO Put results here eventually in a refactor, for now just redirect
export default function Home() {
    return redirect('/research-results/all')
}

