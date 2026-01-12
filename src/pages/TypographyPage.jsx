/**
 * @chunk 2.21 - TypefaceManager
 * @chunk 2.24 - TypographyRoleEditor
 * 
 * Typography management page for configuring typefaces and typography roles.
 */
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useTypefaces } from '../hooks/useTypefaces';
import { TypefaceManager, TypographyRoleEditor } from '../components/themes/typography';
import '../styles/typography-page.css';

export default function TypographyPage() {
  const { id } = useParams();
  const { data: typefaces, isLoading, error, refetch } = useTypefaces(id);

  // Loading state
  if (isLoading) {
    return (
      <div className="page typography-page">
        <header className="page-header">
          <div className="page-header-left">
            <Link to={`/themes/${id}`} className="btn btn-ghost">
              <ArrowLeft size={16} />
              Back to Theme
            </Link>
            <h1>Typography</h1>
          </div>
        </header>
        <main className="page-content">
          <div className="typography-loading">
            <Loader2 size={32} className="spin" />
            <span>Loading typography settings...</span>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page typography-page">
        <header className="page-header">
          <div className="page-header-left">
            <Link to={`/themes/${id}`} className="btn btn-ghost">
              <ArrowLeft size={16} />
              Back to Theme
            </Link>
            <h1>Typography</h1>
          </div>
        </header>
        <main className="page-content">
          <div className="typography-error">
            <AlertCircle size={32} />
            <h3>Failed to load typography settings</h3>
            <p>{error.message || 'An error occurred while loading data.'}</p>
            <button className="btn btn-primary" onClick={refetch}>
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page typography-page">
      <header className="page-header">
        <div className="page-header-left">
          <Link to={`/themes/${id}`} className="btn btn-ghost">
            <ArrowLeft size={16} />
            Back to Theme
          </Link>
          <h1>Typography</h1>
        </div>
      </header>
      
      <main className="page-content typography-sections">
        {/* Typeface Manager - uses the same typefaces/refetch as the role editor to avoid stale UI */}
        <TypefaceManager themeId={id} typefaces={typefaces || []} onRefresh={refetch} isLoading={isLoading} error={error} />
        
        {/* Typography Role Editor - needs typefaces for font preview */}
        <TypographyRoleEditor themeId={id} typefaces={typefaces || []} />
      </main>
    </div>
  );
}
