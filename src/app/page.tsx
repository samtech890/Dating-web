"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import AccountMenu from "@/components/AccountMenu";

const profiles = [
  { name: "Sofia", age: 29, city: "Brooklyn, NY", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85", bio: "Collecting little moments, old records, and passport stamps.", interests: ["Sunday markets", "Jazz", "Slow travel"], intention: "A long-term relationship" },
  { name: "Elliot", age: 31, city: "Queens, NY", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85", bio: "Creative by day. Amateur pasta maker every other night.", interests: ["Cooking", "Architecture", "Live music"], intention: "A meaningful partnership" },
  { name: "Maya", age: 28, city: "Manhattan, NY", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85", bio: "Here for curious minds and plans that start with coffee.", interests: ["Art books", "Hiking", "Coffee"], intention: "A long-term relationship" },
];
const faqs = [
  ["What is HeartLink?", "HeartLink is an adults-only dating experience centered on relationship intentions, shared interests, and more thoughtful ways to meet."],
  ["Who can join HeartLink?", "HeartLink is intended for adults aged 18 and over. Create an account to get started."],
  ["How does matching work?", "The product uses the preferences and interests you choose to share to add context to discovery. Complete your profile to start discovering compatible people."],
  ["How does HeartLink protect my privacy?", "Privacy controls are built into the platform. You can control profile visibility, manage your data, and block users. Your information is protected with secure authentication."],
  ["Can I control who sees my profile?", "Yes. You can control whether your profile is discoverable in discovery settings. Privacy controls are available in your account settings."],
  ["How can I report or block someone?", "Reporting and blocking features are available to help you maintain a safe experience. Use these tools whenever you need to set boundaries."],
];
const interests = ["Music", "Art", "Travel", "Books", "Gaming", "Food", "Outdoors", "Film"];
const interestSymbols = ["♫", "◈", "↗", "▤", "⌘", "✳", "⌁", "◌"];

function Mark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M18 29.2 6.3 18.1a7 7 0 0 1 9.9-9.9L18 10l1.8-1.8a7 7 0 0 1 9.9 9.9L18 29.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M11.4 18h4l2-3.8 2.5 7.2 1.8-3.4h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg className={diagonal ? "arrow diagonal" : "arrow"} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d={diagonal ? "M5 15 15 5M6 5h9v9" : "M3.5 10h12m-5-5 5 5-5 5"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Wordmark({ footer = false }: { footer?: boolean }) {
  return <a href="#top" className={`wordmark${footer ? " footer-mark" : ""}`} aria-label="HeartLink home"><Mark /><span>heart<span>link</span></span></a>;
}
function Kicker({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className="section-kicker"><span>{number}</span><span className="kicker-rule" />{children}</div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileIndex, setProfileIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedInterests, setSelectedInterests] = useState(["Music", "Art", "Travel"]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const profile = profiles[profileIndex];
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!supabase) {
      setCheckingAuth(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    setCheckingAuth(false);
  };
  const advanceProfile = (action: "like" | "pass") => {
    setFeedback(action === "like" ? `A little appreciation for ${profile.name}. Demo only — no connection was sent.` : `${profile.name} passed by. This is only a demo.`);
    setProfileIndex((current) => (current + 1) % profiles.length);
  };
  const toggleInterest = (interest: string) => setSelectedInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]);

  return <main id="top">
    <header className="site-header"><div className="nav-shell"><Wordmark />
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"}><span/><span/></button>
      <nav className={menuOpen ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation"><a onClick={() => setMenuOpen(false)} href="#preview">Discover</a><a onClick={() => setMenuOpen(false)} href="#journey">How it works</a><a onClick={() => setMenuOpen(false)} href="#approach">Our approach</a><a onClick={() => setMenuOpen(false)} href="#safety">Safety</a></nav>
      <div className="nav-actions">
        {checkingAuth ? (
          <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: "rgba(233,224,255,.12)" }} />
        ) : isAuthenticated ? (
          <AccountMenu />
        ) : (
          <>
            <a className="login-link" href="/auth/login">Log in</a>
            <a className="button button-small" href="/auth/register">Join HeartLink <Arrow diagonal/></a>
          </>
        )}
      </div>
    </div></header>

    <section className="hero section-wrap" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot"/> A more considered kind of dating</p>
      <h1 id="hero-title">Some connections<br/>just feel <span className="serif-accent">different.</span></h1><p className="hero-description">Meet people who share your values, understand your interests, and want something meaningful.</p>
      <div className="hero-actions"><a href="#preview" className="button">Find your connection <Arrow/></a><a href="#journey" className="text-link">Discover how it works <Arrow/></a></div>
      <div className="hero-footnote"><div className="mini-avatars">{profiles.map((person) => <img key={person.name} src={person.image} alt=""/>)}</div><span>A little more you. A little less swiping.</span></div>
    </div><div className="hero-art" aria-label="Illustrative profile cards, all fictional demo profiles"><div className="art-glow"/>
      <svg className="connection-line" viewBox="0 0 480 480" aria-hidden="true"><path d="M53 284C121 220 143 363 222 290s96-164 205-133"/><circle cx="53" cy="284" r="3"/><circle cx="427" cy="157" r="3"/></svg>
      <div className="hero-card hero-card-back"><img src={profiles[1].image} alt="Fictional demo profile portrait"/><div className="hero-card-label"><span>Elliot, 31</span><small>DEMO PROFILE</small></div></div>
      <div className="hero-card hero-card-main"><img src={profiles[0].image} alt="Fictional demo profile portrait"/><div className="photo-shade"/><div className="hero-card-label"><span>Sofia, 29</span><small>DEMO PROFILE</small></div><div className="hero-interests"><span>Jazz</span><span>Slow travel</span></div></div>
      <div className="compat-card"><div className="compat-icon"><Mark/></div><div><small>JUST A DEMO</small><p>A shared love<br/>of <b>the little things.</b></p></div><div className="compat-tags"><span>✳</span><span>♫</span></div></div><div className="art-caption"><span className="caption-line"/>Every profile shown is fictional</div>
    </div><div className="hero-bottom-rule"><span>01 / 04</span><span>Thoughtful by design</span><a href="#manifesto" aria-label="Scroll to discover"><span className="scroll-dot"/>Scroll to explore</a></div></section>

    <section className="manifesto section-wrap" id="manifesto"><Kicker number="01">The HeartLink difference</Kicker><div className="manifesto-heading"><h2>Less endless scrolling.<br/><span className="serif-accent">More meaningful</span> connections.</h2><p>Dating can feel more like you. We’re imagining a more intentional way to meet, grounded in the things that actually matter.</p></div>
      <div className="story-grid"><article className="story-card story-values"><div className="story-top"><span className="story-index">01 — A little more aligned</span><span className="story-icon">↗</span></div><div className="values-visual"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="orbit-node node-a">What matters</span><span className="orbit-node node-b">What you love</span><span className="orbit-heart"><Mark/></span></div><div className="story-copy"><h3>Shared values</h3><p>Make room for the intentions and interests you’d like a connection to grow from.</p></div></article>
      <article className="story-card story-discovery"><div className="story-top"><span className="story-index">02 — Context over endless cards</span><span className="story-icon">↗</span></div><div className="discovery-visual"><div className="discovery-note"><span className="tiny-spark">✳</span><span>Something in common</span></div><div className="discovery-photo"><img src={profiles[2].image} alt="Fictional profile illustration for the discovery concept"/><span>DEMO PROFILE</span></div><div className="discovery-caption"><span>Art books, weekend walks</span><span>↗</span></div></div><div className="story-copy"><h3>Thoughtful discovery</h3><p>Explore introductions with a little context, not just another face in an endless stack.</p></div></article>
      <article className="story-card story-conversation"><div className="story-top"><span className="story-index">03 — Find your opening line</span><span className="story-icon">↗</span></div><div className="chat-visual"><div className="chat-bubble chat-left">You’re a Sunday market person too?<span>10:42</span></div><div className="chat-bubble chat-right">Only if there’s good coffee nearby<span>10:44</span></div><div className="chat-suggestion"><span>✳</span> A shared love of slow mornings</div></div><div className="story-copy"><h3>Conversations that begin naturally</h3><p>Shared hobbies can make a lovely place to start talking.</p></div></article></div></section>

    <section className="preview-section" id="preview"><div className="section-wrap preview-wrap"><Kicker number="02">A first look, just for you</Kicker><div className="preview-heading"><div><p className="eyebrow">A window into what could be</p><h2>Meet the feeling<br/>before the <span className="serif-accent">first hello.</span></h2></div><p>See what a little more context could look like. This is an interactive product preview — every profile is fictional, and your choices stay right here.</p></div>
      <div className="demo-layout"><div className="demo-intro"><span className="demo-pill"><span/> DEMO MODE</span><h3>Curiosity<br/>looks good<br/><span className="serif-accent">on you.</span></h3><p>Get a feel for a more thoughtful kind of discovery. No accounts, messages, or real connections involved.</p><div className="demo-count"><span>PROFILE</span><b>0{profileIndex + 1} <i>/ 03</i></b></div><div className="demo-feedback" aria-live="polite">{feedback || "Try a Like or Pass to preview the interaction."}</div></div>
      <article className="profile-preview" aria-label="Fictional profile demo"><div className="profile-photo"><img key={profile.image} src={profile.image} alt={`Fictional demo portrait of ${profile.name}`}/><span className="demo-photo-label">FICTIONAL PROFILE · DEMO</span><div className="profile-name"><h3>{profile.name}<span>, {profile.age}</span></h3><p>{profile.city}</p></div></div><div className="profile-details"><p className="profile-bio">“{profile.bio}”</p><div className="detail-label">A FEW THINGS I LOVE</div><div className="profile-tags">{profile.interests.map((interest) => <span key={interest}>{interest}</span>)}</div><div className="intention-row"><span>Looking for</span><b>{profile.intention}</b></div><div className="profile-controls"><button onClick={() => advanceProfile("pass")} className="pass-button" aria-label="Pass on this fictional profile"><span>×</span> Pass</button><button onClick={() => advanceProfile("like")} className="like-button" aria-label="Like this fictional profile"><Mark/> Like</button></div></div></article><div className="preview-aside"><span className="aside-line"/><p>Real connection begins with being seen for who you are.</p><span className="aside-number">H · 02</span></div></div>
    </div></section>

    <section className="constellation-section section-wrap" id="constellation"><Kicker number="03">The things that bring us closer</Kicker><div className="constellation-heading"><h2>Connection is in<br/>the <span className="serif-accent">small things.</span></h2><p>It might be that book you both underlined, the gig you still talk about, or the dish you’re perfecting. Start with what makes you, you.</p></div>
      <div className="constellation"><svg className="constellation-lines" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true"><path d="M174 144 361 255 516 132 697 276 843 136M361 255 227 380 697 276 786 406M516 132 572 388 227 380M174 144 516 132 843 136"/><circle cx="174" cy="144" r="3"/><circle cx="361" cy="255" r="3"/><circle cx="516" cy="132" r="3"/><circle cx="697" cy="276" r="3"/><circle cx="843" cy="136" r="3"/><circle cx="227" cy="380" r="3"/><circle cx="572" cy="388" r="3"/><circle cx="786" cy="406" r="3"/></svg><div className="constellation-center"><span className="constellation-mark"><Mark/></span><span>the things<br/>that feel like you</span></div>
      {interests.map((interest, index) => <button key={interest} className={`interest-node interest-${index}${selectedInterests.includes(interest) ? " is-selected" : ""}`} aria-pressed={selectedInterests.includes(interest)} onClick={() => toggleInterest(interest)}><span className="interest-symbol">{interestSymbols[index]}</span>{interest}</button>)}<div className="constellation-hint"><span className="hint-dot"/> Choose what feels like you</div></div><div className="constellation-footer"><p>Shared interests are just a starting point, not a formula. Pick a few to see your constellation take shape.</p><span>{selectedInterests.length} SELECTED</span></div></section>

    <section className="journey-section" id="journey"><div className="section-wrap journey-wrap"><Kicker number="04">Four steps, on your terms</Kicker><div className="journey-heading"><h2>A little less<br/><span className="serif-accent">guesswork.</span></h2><p>No grand promises. Just a more considered path from “nice to meet you” to seeing where a conversation goes.</p></div><div className="journey-steps">{[["01", "Create your profile", "A space to share the things that feel most like you."], ["02", "Share what matters", "Choose the interests and intentions you want others to see."], ["03", "Discover compatible people", "Explore introductions with a little more meaning and context."], ["04", "Start a conversation", "Find an easy opening, then see where it takes you."]].map(([number, title, description]) => <article className="journey-step" key={number}><span className="step-number">{number}</span><span className="step-dot"/><h3>{title}</h3><p>{description}</p><Arrow diagonal/></article>)}</div></div></section>

    <section className="approach-section section-wrap" id="approach"><div className="approach-art"><div className="approach-image"><img src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1100&q=85" alt="Friends sharing an unhurried dinner together"/><span className="image-credit">A moment, not a metric.</span></div><div className="approach-stamp"><Mark/><span>More human,<br/>by design.</span></div><div className="approach-caption">GOOD THINGS TAKE THEIR OWN TIME <span>✳</span></div></div><div className="approach-copy"><Kicker number="05">A note on intention</Kicker><h2>Dating should feel like <span className="serif-accent">your life.</span></h2><p className="approach-lede">Not an audition. Not a numbers game. Just a chance to be curious about another person, at a pace that feels right.</p><ul className="approach-list"><li><span>01</span><div><b>Intentions, without the guesswork</b><p>Make it easier to share what kind of connection you hope to find.</p></div><Arrow diagonal/></li><li><span>02</span><div><b>Preferences that put you first</b><p>Choose what matters to you and what you’d like to keep private.</p></div><Arrow diagonal/></li><li><span>03</span><div><b>Space for real conversation</b><p>Start with the little things you might already have in common.</p></div><Arrow diagonal/></li></ul><div className="approach-note"><span>✳</span> No promises about love. Just more thoughtful ways to meet.</div></div></section>

    <section className="safety-section" id="safety"><div className="section-wrap safety-wrap"><div className="safety-heading"><div><Kicker number="06">Respect is the starting point</Kicker><h2>Good connections<br/>need <span className="serif-accent">good boundaries.</span></h2></div><p>Safety features are built into HeartLink to help you feel secure while connecting.</p></div><div className="safety-grid"><article><span className="safety-icon">⊘</span><h3>Block & report</h3><p>Clear ways to set a boundary or raise a concern, whenever you need them.</p><span className="planned-label">AVAILABLE</span></article><article><span className="safety-icon">◉</span><h3>Your privacy, your choice</h3><p>Thoughtful profile visibility settings, designed around your comfort.</p><span className="planned-label">AVAILABLE</span></article><article><span className="safety-icon">⌑</span><h3>Account protection</h3><p>Secure sign-in with email and Google OAuth, plus sensible safeguards.</p><span className="planned-label">IMPLEMENTED</span></article><article><span className="safety-icon">✳</span><h3>Community standards</h3><p>Clear expectations and considered abuse-prevention processes matter.</p><span className="planned-label">COMING SOON</span></article></div><a href="#faq" className="safety-link">Explore our safety principles <Arrow/></a></div></section>

    <section className="faq-section section-wrap" id="faq"><div className="faq-intro"><Kicker number="07">A few good questions</Kicker><h2>Things you<br/>might <span className="serif-accent">wonder.</span></h2><p>Clear answers, because trust starts with being upfront.</p><span className="faq-aside">STILL A LITTLE CURIOUS? <span>↘</span></span></div><div className="faq-list">{faqs.map(([question, answer], index) => <article key={question} className={`faq-item${openFaq === index ? " faq-open" : ""}`}><button className="faq-question" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span className="faq-index">0{index + 1}</span><span>{question}</span><span className="faq-plus" aria-hidden="true">{openFaq === index ? "−" : "+"}</span></button><div className="faq-answer" hidden={openFaq !== index}><p>{answer}</p></div></article>)}</div></section>

    <section className="final-section" id="join"><div className="final-orbit final-orbit-a"/><div className="final-orbit final-orbit-b"/><div className="final-content"><span className="final-kicker"><Mark/> MAKE ROOM FOR SOMETHING REAL</span><h2>Your next meaningful<br/>connection starts with<br/><span className="serif-accent">a conversation.</span></h2><p>Make room for something real.</p><a href="/auth/register" className="button final-button">Join HeartLink <Arrow/></a><span className="final-disclaimer">For adults 18 and over. Create your profile to start connecting.</span></div><span className="final-side-note">A MORE CONSIDERED KIND OF DATING <span>H · 2025</span></span></section>

    <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><Wordmark footer/><p>Real connections.<br/>Shared moments.</p><span>FOR ADULTS 18 AND OVER.</span></div><div className="footer-links"><div><span>EXPLORE</span><a href="#approach">About</a><a href="#faq">Questions</a><a href="#safety">Safety</a><a href="#manifesto">Our approach</a></div><div><span>THE DETAILS</span><a href="#faq">Privacy principles</a><a href="#faq">Terms of service</a><a href="#safety">Community guidelines</a></div><div className="footer-news"><span>GET STARTED</span><p>Create your profile and start discovering meaningful connections today.</p><a href="/auth/register">Join HeartLink</a></div></div></div><div className="footer-bottom"><span>© 2025 HeartLink. Real connections. Shared moments.</span><span>18+ &nbsp;·&nbsp; A more considered kind of dating.</span></div></footer>
  </main>;
}
