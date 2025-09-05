import React, { useState, useEffect } from 'react';
import { MapPin, Building2, DollarSign, Clock } from 'lucide-react';

const ShimmerEffect = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
);

function JobCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-200/70 rounded-xl relative overflow-hidden">
          <ShimmerEffect />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-6 w-48 bg-gray-200/70 rounded mb-2 relative overflow-hidden">
                <ShimmerEffect />
              </div>
              <div className="h-4 w-32 bg-gray-200/70 rounded relative overflow-hidden">
                <ShimmerEffect />
              </div>
            </div>
            <div className="h-10 w-24 bg-gray-200/70 rounded-xl relative overflow-hidden">
              <ShimmerEffect />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="h-4 w-24 bg-gray-200/70 rounded relative overflow-hidden">
              <ShimmerEffect />
            </div>
            <div className="h-4 w-32 bg-gray-200/70 rounded relative overflow-hidden">
              <ShimmerEffect />
            </div>
            <div className="h-4 w-28 bg-gray-200/70 rounded relative overflow-hidden">
              <ShimmerEffect />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function JobList({ searchQuery, filters }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10; // Limit the number of jobs per page
  const maxPageButtons = 5; // Limit the number of page buttons shown

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(import.meta.env.VITE_REMOTIVE_API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        } else {
          throw new Error('Job data is missing or not in the expected format');
        }
      } catch (error) {
        setError(error.message);
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const jobMatch = filters.jobType.length
      ? filters.jobType.includes(job.job_type)
      : true;
    const locationMatch = filters.location.length
      ? filters.location.includes(job.candidate_required_location.split(',')[0])
      : true;
    const searchMatch = job.title.toLowerCase().includes(searchQuery.job.toLowerCase()) &&
                        job.candidate_required_location.toLowerCase().includes(searchQuery.location.toLowerCase());

    return jobMatch && locationMatch && searchMatch;
  });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {currentJobs.length === 0 ? (
        <div>No jobs available</div>
      ) : (
        currentJobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <img
                src={job.company_logo || 'https://via.placeholder.com/100'}
                alt={job.company_name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600 flex items-center mt-1">
                      <Building2 className="w-4 h-4 mr-1" />
                      {job.company_name}
                    </p>
                  </div>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors inline-block"
                  >
                    Apply Now
                  </a>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.candidate_required_location.split(',')[0] || 'Remote'}
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {job.salary || 'Salary not listed'}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(job.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      <div className="flex justify-center space-x-2 mt-4">
        {startPage > 1 && (
          <button
            onClick={() => handlePageChange(startPage - 1)}
            className="px-3 py-1 rounded-full bg-gray-200 text-gray-700"
          >
            &laquo;
          </button>
        )}
        {[...Array(endPage - startPage + 1).keys()].map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(startPage + page)}
            className={`px-3 py-1 rounded-full ${currentPage === startPage + page ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {startPage + page}
          </button>
        ))}
        {endPage < totalPages && (
          <button
            onClick={() => handlePageChange(endPage + 1)}
            className="px-3 py-1 rounded-full bg-gray-200 text-gray-700"
          >
            &raquo;
          </button>
        )}
      </div>
    </div>
  );
}
