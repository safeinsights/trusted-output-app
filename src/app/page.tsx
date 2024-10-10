import { footerStyles, mainStyles, pageStyles } from './page.css'
import Link from 'next/link'

export default function Home() {
    return (
        <div className={pageStyles}>
            <main className={mainStyles}>
                <p>SafeInsights - Trusted Output App</p>
                <Link href="/research-results/all"> Research Results </Link>
            </main>
            <footer className={footerStyles}>A SafeInsights production</footer>
        </div>
    )
}
