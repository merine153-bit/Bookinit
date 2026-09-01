"use client";

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SaveButton } from "@/components/social/save-button";
import { cn, formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: MenuItem;
  /** "compact" صف أفقي بصورة صغيرة، و"featured" بطاقة بصورة كبيرة أعلاها. */
  variant?: "compact" | "featured";
  restaurantName?: string;
}

/** بطاقة صنف من القائمة — تفتح تفاصيل الطبق عند النقر. */
export function MenuItemCard({ item, variant = "compact", restaurantName }: MenuItemCardProps) {
  const [open, setOpen] = React.useState(false);
  const price = formatPrice(item.price, item.currency);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${item.name} — ${price}`}
        className={cn(
          "w-full text-start bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden transition-all duration-200 hover:shadow-level-2 hover:-translate-y-0.5 active:scale-[0.995]",
          !item.isAvailable && "opacity-60",
        )}
      >
        {variant === "compact" ? (
          <div className="flex gap-4 p-gutter">
            <div className="size-24 rounded-lg overflow-hidden shrink-0 relative">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div>
                <h4 className="font-body text-label-md text-on-surface mb-1">{item.name}</h4>
                <p className="font-body text-label-sm text-on-surface-variant line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 mt-2">
                <span className="numeric font-display text-label-md font-bold text-primary">{price}</span>
                {!item.isAvailable && (
                  <span className="font-body text-label-sm text-error">غير متوفر حالياً</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
              />
            </div>
            <div className="p-gutter flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="font-display text-label-md text-on-surface min-w-0">{item.name}</h4>
                <span className="numeric font-display text-headline-md font-bold text-on-surface shrink-0">
                  {price}
                </span>
              </div>
              <p className="font-body text-body-md text-on-surface-variant">{item.description}</p>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} tone="forest">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={item.name} description={restaurantName} variant="drawer">
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-stack-lg">
          <Image src={item.imageUrl} alt={item.name} fill sizes="520px" className="object-cover" />
        </div>
        <div className="flex items-center justify-between gap-4 mb-stack-md">
          <span className="numeric font-display text-headline-lg font-bold text-primary">{price}</span>
          <SaveButton type="menu_item" id={item.id} withLabel />
        </div>
        <p className="font-body text-body-lg text-on-surface-variant">{item.description}</p>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-stack-lg">
            {item.tags.map((tag) => (
              <Badge key={tag} tone="forest">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {!item.isAvailable && (
          <p className="mt-stack-lg rounded-lg bg-error-container px-4 py-3 font-body text-label-md text-on-error-container">
            هذا الصنف غير متوفر حالياً.
          </p>
        )}
      </Modal>
    </>
  );
}
