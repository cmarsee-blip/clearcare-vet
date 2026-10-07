import { NavLink, useParams } from 'react-router-dom'
import NotFound from './NotFound'
import { site } from '../config/site'

// IMPORTANT: this is placeholder wording so the pages, links and sign-up
// checkbox exist. It is not legal advice and has not been reviewed by a
// lawyer. Replace it before the site is public.
const docs = {
  terms: {
    title: 'Terms of use',
    sections: [
      ['What this site is', `${site.name} is a directory where animal owners find veterinarians and clinics, compare listed prices, and read and write reviews. We do not provide veterinary care and we are not a party to any agreement between an owner and a veterinarian or clinic.`],
      ['Not veterinary advice', 'Nothing on this site is veterinary advice. Prices and reviews are shared by other people and may be out of date or wrong. Always confirm prices and treatment with the veterinarian. In an emergency, call your veterinarian or the nearest emergency clinic.'],
      ['Your account', 'You are responsible for what is posted from your account. Use your real identity, keep your login details private, and tell us if you think someone else has used your account.'],
      ['Veterinarians and clinics', 'Listed prices are estimates you provide and agree to keep reasonably current. A Verified badge means we checked the license number you gave us at the time. It is not an endorsement.'],
      ['Reviews and price reports', 'Reviews and price reports must follow the review policy. We may remove content that breaks it. We do not edit reviews, and we do not remove them because a business asks or pays.'],
      ['Appointment requests', 'An appointment request is a message to the clinic, not a confirmed booking. The clinic decides whether and when to see you.'],
      ['Changes', 'We may update these terms. If the changes are significant we will tell account holders before they take effect.'],
    ],
  },
  privacy: {
    title: 'Privacy policy',
    sections: [
      ['What we collect', 'Account details (name, email, ZIP code), the animals and health records you choose to add, reviews and price reports you post, messages and appointment requests you send, and basic usage data such as pages viewed.'],
      ['What is public', 'Reviews show your first name and last initial, the procedure, the animal if you choose, and the amount you paid. Quick price reports show only the amount. Your email, address and health records are never shown publicly.'],
      ['Who sees what', 'A veterinarian or clinic sees the messages and appointment requests you send them, with your name. Invoices you upload are seen only by our moderation team and are used only to confirm a visit took place.'],
      ['Location', 'If you choose “Use my location”, your browser shares an approximate position to sort results by distance. We do not store it.'],
      ['Your choices', 'You can edit or delete your reviews, price reports, animals and health records at any time from your profile. To delete your account, contact us.'],
      ['Contact', 'Questions about privacy: privacy@example.com.'],
    ],
  },
  reviews: {
    title: 'Review policy',
    sections: [
      ['Who can post', 'Only owners who took their own animal to that veterinarian or clinic. One review per visit. Staff, relatives of staff and competitors may not review.'],
      ['What a good review covers', 'What was done, how your animal recovered, how you were treated, and whether the bill matched the estimate. Stick to what you experienced first-hand.'],
      ['What is not allowed', 'False statements of fact, threats or abuse, private details about staff or other clients, medical accusations you cannot support, and anything written in exchange for a discount or payment.'],
      ['Verified visits', 'Attach your invoice and our team will check it against the visit. A matching invoice earns the review a “Verified visit” badge. The invoice is not published.'],
      ['Replies', 'A veterinarian or clinic may post one public reply. Replies must not reveal private details about the animal or owner beyond what the review already says.'],
      ['Reporting and removal', 'Anyone logged in can report a review. It stays up while we look. We remove reviews that break this policy and tell the author. We do not remove a review because it is negative.'],
    ],
  },
}

export default function Legal() {
  const { doc } = useParams()
  const page = docs[doc]
  if (!page) return <NotFound />

  return (
    <div className="container legal-page">
      <nav className="legal-nav" aria-label="Policies">
        <NavLink to="/legal/terms">Terms of use</NavLink>
        <NavLink to="/legal/privacy">Privacy policy</NavLink>
        <NavLink to="/legal/reviews">Review policy</NavLink>
      </nav>
      <article>
        <h1>{page.title}</h1>
        <p className="callout draft-notice">
          <strong>Draft.</strong> This is placeholder wording, not legal advice. Have a lawyer review and replace it before the site is public.
        </p>
        {page.sections.map(([heading, text]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </section>
        ))}
      </article>
    </div>
  )
}
