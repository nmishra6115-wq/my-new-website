export function buildActiveJobPostingsJsonLd(activeJobs = [], pageUrl = 'https://www.amldecode.in/') {
  const list = Array.isArray(activeJobs) ? activeJobs : [];

  const postings = list
    .filter((job) => job && job.status === 'active' && job.title && job.employer && job.applicationUrl)
    .map((job) => {
      const entry = {
        '@type': 'JobPosting',
        title: job.title,
        hiringOrganization: {
          '@type': 'Organization',
          name: job.employer,
        },
        url: job.applicationUrl,
        directApply: true,
        mainEntityOfPage: pageUrl,
      };

      if (job.publishedAt) {
        entry.datePosted = job.publishedAt;
      }

      if (job.remoteEligibility === 'remote') {
        entry.jobLocationType = 'TELECOMMUTE';
      } else {
        entry.jobLocation = {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.city || undefined,
            addressRegion: job.state || undefined,
            addressCountry: 'IN',
          },
        };
      }

      return entry;
    });

  return {
    '@context': 'https://schema.org',
    '@graph': postings,
  };
}
