import React from 'react';

export default function About() {
  return (
    <div className='py-20 px-4 max-w-6xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4 text-slate-800'>About IIT BHU Issues Tracker</h1>
      <p className='mb-4 text-slate-700'>
        The IIT BHU Issues Tracker is a centralized campus platform designed to streamline hostel maintenance, facility tracking, and infrastructure management. It provides students and administration with a transparent, structured system to log, monitor, and resolve day-to-day residential issues efficiently.
      </p>
      <p className='mb-4 text-slate-700'>
        From electrical faults and plumbing failures to urgent safety hazards in private rooms or common areas, the platform allows residents to submit detailed reports accompanied by proof of damage, location context, and impact metrics.
      </p>
      <p className='mb-4 text-slate-700'>
        By categorizing problems using quantifiable severity scores, urgency flags, and direct escalation channels to wardens, the system ensures critical issues receive immediate prioritization to maintain safe and functional living spaces across campus.
      </p>
    </div>
  );
}