/**
 * @chunk 4.08 - ImportReviewModal
 * 
 * Display list of component variants from Figma import.
 */

export default function VariantsList({ variants }) {
  if (!variants || variants.length === 0) {
    return (
      <div className="variants-list-empty">
        <p>No variants found in this component.</p>
      </div>
    );
  }

  return (
    <div className="variants-list">
      <div className="variants-list-header">
        <p>
          Component variants extracted from Figma. These represent different
          combinations of variant properties.
        </p>
      </div>

      <div className="variants-grid">
        {variants.map((variant, index) => (
          <div key={index} className="variant-card">
            <div className="variant-card-header">
              <h4>{variant.name || `Variant ${index + 1}`}</h4>
            </div>
            {variant.props && Object.keys(variant.props).length > 0 && (
              <div className="variant-props">
                {Object.entries(variant.props).map(([key, value]) => (
                  <div key={key} className="variant-prop">
                    <span className="variant-prop-name">{key}:</span>
                    <span className="variant-prop-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
            {variant.nodeId && (
              <div className="variant-meta">
                <span className="variant-node-id">Node: {variant.nodeId}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

