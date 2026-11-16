import type { SelectHTMLAttributes } from 'react';

/** Native pixel frame lives on a wrapper because select does not paint pseudo-elements. */
export function FilterSelect({className='',...props}:SelectHTMLAttributes<HTMLSelectElement>){
  return <span className="chip btn small ghost replica-filter"><select {...props} className={`replica-filter-control ${className}`}/></span>;
}
