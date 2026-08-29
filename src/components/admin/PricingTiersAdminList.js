"use client";

import { useState } from "react";
import { PricingTierEditor } from "@/components/admin/PricingTierEditor";

export function PricingTiersAdminList({ tiers: initialTiers }) {
  const [tiers, setTiers] = useState(initialTiers || []);
  const [editingTierId, setEditingTierId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const sortedTiers = [...tiers].sort((a, b) => a.order - b.order);

  const handleSaved = (updatedTier, action) => {
    if (action === "deleted") {
      setTiers((prev) => prev.filter((t) => t._id !== editingTierId));
      setEditingTierId(null);
    } else if (updatedTier) {
      setTiers((prev) =>
        prev.some((t) => t._id === updatedTier._id)
          ? prev.map((t) => (t._id === updatedTier._id ? updatedTier : t))
          : [...prev, updatedTier]
      );
      setEditingTierId(null);
      setIsAddingNew(false);
    }
  };

  const handleCancel = () => {
    setEditingTierId(null);
    setIsAddingNew(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {sortedTiers.map((tier, index) =>
          editingTierId === tier._id ? (
            <PricingTierEditor
              key={tier._id}
              tier={tier}
              tierNumber={index + 1}
              onSaved={handleSaved}
              onCancel={handleCancel}
            />
          ) : (
            <div
              key={tier._id}
              className="border border-border rounded p-6 bg-surface hover:border-accent transition-colors cursor-pointer group"
              onClick={() => setEditingTierId(tier._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-accent-2 tracking-widest">N°{index + 1}</span>
                    <h3 className="font-display text-xl uppercase tracking-widest text-highlight">
                      {tier.name}
                    </h3>
                  </div>
                  <p className="font-mono text-lg text-accent-2 mb-3">{tier.price}</p>
                  {tier.description && (
                    <p className="text-sm text-muted mb-3">{tier.description}</p>
                  )}
                  {tier.features?.length > 0 && (
                    <ul className="text-xs text-muted space-y-1">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-accent-2 shrink-0">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!tier.isActive && (
                    <p className="text-xs text-error font-mono mt-3 uppercase tracking-widest">Inactive</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTierId(tier._id);
                  }}
                  className="px-3 py-2 font-mono text-xs tracking-widest uppercase bg-accent hover:bg-accent-hover text-bg transition-colors opacity-0 group-hover:opacity-100"
                >
                  Edit
                </button>
              </div>
            </div>
          )
        )}

        {isAddingNew && (
          <PricingTierEditor
            tier={null}
            tierNumber={sortedTiers.length + 1}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}
      </div>

      {!isAddingNew && (
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-4 py-3 font-mono text-sm tracking-widest uppercase border border-dashed border-border bg-surface hover:bg-surface-2 hover:border-accent transition-colors"
        >
          + Add Tier
        </button>
      )}
    </div>
  );
}
