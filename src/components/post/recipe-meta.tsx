import type { RecipeMetaData } from '@/types'

interface RecipeMetaProps {
  meta: RecipeMetaData
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span
        className="text-[10px] uppercase tracking-wider text-stone block"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
      <span
        className="text-base text-bark block"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </span>
    </div>
  )
}

export default function RecipeMeta({ meta }: RecipeMetaProps) {
  return (
    <div className="border border-rule rounded-sm p-5 my-6">
      <h3
        className="text-lg text-bark mb-4"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Recipe
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {meta.prep_time && <Cell label="Prep time" value={meta.prep_time} />}
        {meta.cook_time && <Cell label="Cook time" value={meta.cook_time} />}
        {meta.servings && <Cell label="Servings" value={String(meta.servings)} />}
        {meta.difficulty && <Cell label="Difficulty" value={meta.difficulty} />}
      </div>
      {meta.equipment && meta.equipment.length > 0 && (
        <ul className="mt-4 space-y-1">
          {meta.equipment.map((item, i) => (
            <li
              key={i}
              className="text-xs text-stone"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              &bull; {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
