import { FormEvent, useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  MapPin,
  PhoneCall,
  Search,
} from 'lucide-react';
import { CURATED_SEARCH_PROMPTS } from '../data/harborContent';
import {
  parseStructuredGuidance,
  validateSearchQuery,
  VerifiedSource,
} from '../utils/harborLogic';

interface GroundedSearchResponse {
  query: string;
  region: string | null;
  answer: string;
  sources: VerifiedSource[];
  searchQueries: string[];
  retrievedAt: string;
}

export function CareFinderSection() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<GroundedSearchResponse | null>(null);

  const runSearch = async (searchQuery: string, searchRegion: string) => {
    const validation = validateSearchQuery(searchQuery);
    if (!validation.valid) {
      setInputError(validation.error ?? 'Please enter a valid query.');
      return;
    }

    setInputError(null);
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await fetch('/api/resources/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: validation.sanitized,
          region: searchRegion.trim(),
        }),
      });

      const payload = (await response.json()) as Partial<GroundedSearchResponse> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error || 'Could not retrieve live verified resources right now.',
        );
      }

      setResult({
        query: payload.query ?? validation.sanitized,
        region: payload.region ?? (searchRegion.trim() || null),
        answer: payload.answer ?? '',
        sources: Array.isArray(payload.sources) ? payload.sources : [],
        searchQueries: Array.isArray(payload.searchQueries)
          ? payload.searchQueries
          : [],
        retrievedAt: payload.retrievedAt ?? new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to reach live search right now.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActivePresetId(null);
    void runSearch(query, region);
  };

  const handleCuratedClick = (
    presetId: string,
    presetQuery: string,
    presetRegion?: string,
  ) => {
    setActivePresetId(presetId);
    setQuery(presetQuery);
    if (presetRegion !== undefined) {
      setRegion(presetRegion);
    }
    void runSearch(presetQuery, presetRegion ?? region);
  };

  const blocks = result ? parseStructuredGuidance(result.answer) : [];

  return (
    <section
      id="care-finder"
      className="scroll-mt-16 py-20 sm:py-28 border-t border-[#D9E3E8] bg-[#F8FAFB]"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-wide text-[#4C6270] mb-3">
              Live Verified Resource Finder
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-[-0.02em] leading-[1.15] text-[#11222C] text-balance">
              Current helplines, clinics, and clinical guidance—grounded in live
              web search.
            </h2>
            <p className="mt-4 text-base leading-[1.65] text-[#425866]">
              Outdated spreadsheets fail people when they need help most. Ask
              Harbor’s live Care Finder for free crisis numbers, sliding-scale
              directories, or current NIMH and APA guidance with verifiable
              source links.
            </p>

            {/* Always-visible immediate crisis safety block */}
            <div className="mt-8 rounded-xl border border-[#D9E3E8] bg-white p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#11222C]">
                <PhoneCall
                  className="w-4 h-4 text-[#0E5A6D] shrink-0"
                  aria-hidden="true"
                />
                <span>Need immediate support right now?</span>
              </div>
              <p className="text-xs leading-relaxed text-[#425866]">
                In the US and Canada, call or text{' '}
                <strong className="font-mono font-semibold text-[#11222C]">
                  988
                </strong>{' '}
                to reach the Suicide &amp; Crisis Lifeline 24/7, or text{' '}
                <strong className="font-mono font-semibold text-[#11222C]">
                  HOME
                </strong>{' '}
                to{' '}
                <strong className="font-mono font-semibold text-[#11222C]">
                  741741
                </strong>{' '}
                for the Crisis Text Line. In an emergency, call local emergency
                services.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl border border-[#D9E3E8] bg-white p-6 sm:p-8">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8">
                    <label
                      htmlFor="care-finder-query"
                      className="block text-xs font-medium text-[#2A4250] mb-1.5"
                    >
                      What care resource or mental health topic are you looking
                      for?
                    </label>
                    <div className="relative">
                      <Search
                        className="w-4 h-4 text-[#4C6270] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="care-finder-query"
                        name="query"
                        type="text"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          if (inputError) setInputError(null);
                        }}
                        placeholder="e.g. Free anxiety support groups or sliding-scale clinics"
                        aria-invalid={Boolean(inputError)}
                        aria-describedby={
                          inputError ? 'care-finder-input-error' : undefined
                        }
                        className="w-full pl-10 pr-4 py-2.5 text-sm text-[#11222C] placeholder:text-[#738A97] bg-[#F8FAFB] border border-[#CBD8DF] rounded-lg focus:bg-white focus:border-[#0E5A6D] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="care-finder-region"
                      className="block text-xs font-medium text-[#2A4250] mb-1.5"
                    >
                      City or country (optional)
                    </label>
                    <div className="relative">
                      <MapPin
                        className="w-4 h-4 text-[#4C6270] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="care-finder-region"
                        name="region"
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="e.g. Seattle, WA"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm text-[#11222C] placeholder:text-[#738A97] bg-[#F8FAFB] border border-[#CBD8DF] rounded-lg focus:bg-white focus:border-[#0E5A6D] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {inputError && (
                  <p
                    id="care-finder-input-error"
                    role="alert"
                    className="text-xs font-medium text-[#9F2D2D]"
                  >
                    {inputError}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#0E5A6D] hover:bg-[#0A4655] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          aria-hidden="true"
                        />
                        <span>Searching Verified Sources...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" aria-hidden="true" />
                        <span>Search Live Resources</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs text-[#4C6270]">
                    Grounded with live Google Search citations
                  </span>
                </div>
              </form>

              {/* Curated quick-query starter actions */}
              <div className="mt-6 pt-5 border-t border-[#EEF3F5]">
                <p className="text-xs font-medium text-[#4C6270] mb-3">
                  Common lookups
                </p>
                <div className="flex flex-wrap gap-2">
                  {CURATED_SEARCH_PROMPTS.map((preset) => {
                    const isSelected = activePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        disabled={loading}
                        aria-pressed={isSelected}
                        onClick={() =>
                          handleCuratedClick(
                            preset.id,
                            preset.query,
                            preset.region,
                          )
                        }
                        className={`px-3.5 py-2 text-xs font-medium border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
                          isSelected
                            ? 'bg-[#E4F1F4] text-[#0A4655] border-[#0E5A6D]'
                            : 'text-[#1F3A47] bg-[#F8FAFB] hover:bg-[#E4F1F4] border-[#D9E3E8] hover:border-[#0E5A6D]/40'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Results / Loading / Error / Empty Region */}
              <div
                aria-live="polite"
                className="mt-6 pt-6 border-t border-[#D9E3E8]"
              >
                {loading && (
                  <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                    <Loader2
                      className="w-6 h-6 text-[#0E5A6D] animate-spin"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-medium text-[#11222C]">
                      Checking current public mental health sources...
                    </p>
                    <p className="text-xs text-[#4C6270]">
                      Verifying helplines, directories, and published clinical
                      guidance.
                    </p>
                  </div>
                )}

                {!loading && errorMessage && (
                  <div
                    role="alert"
                    className="rounded-lg border border-[#E5C6C6] bg-[#FDF6F6] p-5 space-y-3"
                  >
                    <div className="flex items-start gap-2.5 text-[#8A2424]">
                      <AlertCircle
                        className="w-4 h-4 mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          Live resource search unavailable
                        </p>
                        <p className="text-xs leading-relaxed text-[#6E2626]">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void runSearch(query, region)}
                      className="px-3.5 py-1.5 text-xs font-medium text-[#11222C] bg-white border border-[#D9E3E8] hover:border-[#0E5A6D] rounded-md transition-colors cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!loading && !errorMessage && !result && (
                  <div className="py-4 text-sm text-[#4C6270] leading-relaxed">
                    Select a common lookup above or enter a location and topic to
                    retrieve up-to-date mental health resources with clickable
                    source citations.
                  </div>
                )}

                {!loading && !errorMessage && result && (
                  <div className="space-y-6" data-testid="care-finder-results">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4C6270]">
                      <span>
                        Results for{' '}
                        <strong className="font-semibold text-[#11222C]">
                          {result.query}
                        </strong>
                        {result.region ? ` · ${result.region}` : ''}
                      </span>
                      <span className="font-mono tabular-nums">
                        Verified{' '}
                        {new Date(result.retrievedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm leading-[1.68] text-[#243B47]">
                      {blocks.map((block, index) => {
                        if (block.type === 'heading') {
                          return (
                            <h3
                              key={`${block.text}-${index}`}
                              className="font-display text-lg font-medium text-[#11222C] pt-2 first:pt-0"
                            >
                              {block.text}
                            </h3>
                          );
                        }
                        if (block.type === 'bullet') {
                          return (
                            <div
                              key={`${block.text}-${index}`}
                              className="flex items-start gap-2.5 pl-1"
                            >
                              <span
                                aria-hidden="true"
                                className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0E5A6D] shrink-0"
                              />
                              <p>{block.text}</p>
                            </div>
                          );
                        }
                        return <p key={`${block.text}-${index}`}>{block.text}</p>;
                      })}
                    </div>

                    {result.sources.length > 0 && (
                      <div className="pt-5 border-t border-[#EEF3F5]">
                        <p className="text-xs font-semibold text-[#11222C] mb-3">
                          Verified Sources ({result.sources.length})
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {result.sources.map((source) => (
                            <li key={source.url}>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-[#D9E3E8] bg-[#F8FAFB] hover:bg-[#E4F1F4]/60 hover:border-[#0E5A6D]/50 transition-colors"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-[#11222C] truncate">
                                    {source.title}
                                  </p>
                                  <p className="text-[11px] font-mono text-[#4C6270] truncate mt-0.5">
                                    {source.domain}
                                  </p>
                                </div>
                                <ExternalLink
                                  className="w-3.5 h-3.5 text-[#0E5A6D] shrink-0 mt-0.5"
                                  aria-hidden="true"
                                />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
