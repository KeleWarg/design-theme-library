/**
 * @chunk 4.08 - ImportReviewModal
 * 
 * Token linker for reviewing and adjusting token mappings from Figma variables.
 */

import { useState } from 'react';
import { Input } from '../ui';
import { LinkIcon } from 'lucide-react';

export default function TokenLinker({ boundVariables, linkedTokens, onChange }) {
  const [tokenMap, setTokenMap] = useState(() => {
    const map = {};
    boundVariables.forEach((bv, index) => {
      map[bv.variableName] = linkedTokens[index] || bv.variableName;
    });
    return map;
  });

  const handleTokenChange = (variableName, newTokenName) => {
    const newMap = { ...tokenMap, [variableName]: newTokenName };
    setTokenMap(newMap);
    onChange(Object.values(newMap));
  };

  if (!boundVariables || boundVariables.length === 0) {
    return (
      <div className="token-linker-empty">
        <p>No token bindings found in this component.</p>
      </div>
    );
  }

  return (
    <div className="token-linker">
      <div className="token-linker-header">
        <p>
          Review token mappings from Figma variables. You can adjust the token names
          to match your design system tokens.
        </p>
      </div>

      <div className="token-linker-list">
        <div className="token-linker-header-row">
          <span className="token-linker-col token-linker-col-figma">Figma Variable</span>
          <span className="token-linker-col token-linker-col-field">Field</span>
          <span className="token-linker-col token-linker-col-token">Token Name</span>
        </div>

        {boundVariables.map((bv, index) => (
          <div key={index} className="token-linker-item">
            <div className="token-linker-figma">
              <LinkIcon size={14} />
              <span className="token-variable-name">{bv.variableName}</span>
              {bv.collectionName && (
                <span className="token-collection-name">{bv.collectionName}</span>
              )}
            </div>
            <div className="token-linker-field">
              <span className="token-field-badge">{bv.field}</span>
            </div>
            <div className="token-linker-token">
              <Input
                value={tokenMap[bv.variableName] || bv.variableName}
                onChange={(e) => handleTokenChange(bv.variableName, e.target.value)}
                placeholder="Token name"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



