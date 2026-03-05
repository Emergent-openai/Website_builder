import { cn } from "@/lib/utils";


const authThemes = [
  {
    id: "editorial-atelier",
    label: "Editorial",
    title: "Editorial atelier",
    description: "Luxury studio website with a desktop-first brand story.",
    imageUrl: "https://static.stage-images.emergentagent.com/jobs/88843593-1129-446d-9f5c-c55bc360aeb3/images/45bb007a1eb311753eee987a84cf295ffc0989e69958e012d034e940b707f928.png",
    tintClassName: "bg-[#F4EFE9] text-zinc-950",
    imageClassName: "object-cover object-top",
    previewAspectClassName: "aspect-[4/5]",
    spanClassName: "xl:col-span-2",
  },
  {
    id: "nocturne-house",
    label: "Architecture",
    title: "Nocturne house",
    description: "Dark architectural presentation with wider desktop framing.",
    imageUrl: "https://static.stage-images.emergentagent.com/jobs/88843593-1129-446d-9f5c-c55bc360aeb3/images/fe47535784190b31a039785ee208efadcd048a6e850dbe61b9ebe171d05f0958.png",
    tintClassName: "bg-[#0B0D11] text-white",
    imageClassName: "object-cover object-center",
    previewAspectClassName: "aspect-[16/10]",
    spanClassName: "xl:col-span-4",
  },
  {
    id: "motion-agency",
    label: "Creative",
    title: "Motion agency",
    description: "Abstract desktop hero with a cleaner agency layout.",
    imageUrl: "https://static.stage-images.emergentagent.com/jobs/88843593-1129-446d-9f5c-c55bc360aeb3/images/2a5ba6509fdb79ec08213de19fc92e728730d5c3e86b12858b5a26a023e31fa0.png",
    tintClassName: "bg-[#090B10] text-white",
    imageClassName: "object-cover object-center",
    previewAspectClassName: "aspect-[16/10]",
    spanClassName: "xl:col-span-4",
  },
  {
    id: "wellness-retreat",
    label: "Wellness",
    title: "Wellness retreat",
    description: "Soft editorial landing page with calm spacing and clarity.",
    imageUrl: "https://static.stage-images.emergentagent.com/jobs/88843593-1129-446d-9f5c-c55bc360aeb3/images/b95913e4fca0f87a43b3ddcdddc0c82abd2f04fbda060f7ba9ff77128cc2937b.png",
    tintClassName: "bg-[#F5F1EC] text-zinc-950",
    imageClassName: "object-cover object-top",
    previewAspectClassName: "aspect-[4/5]",
    spanClassName: "xl:col-span-2",
  },
  {
    id: "analytics-noir",
    label: "Analytics",
    title: "Analytics noir",
    description: "SaaS direction with richer charts and stronger desktop presence.",
    imageUrl: "https://static.stage-images.emergentagent.com/jobs/88843593-1129-446d-9f5c-c55bc360aeb3/images/f6c43e0c653afa7171b600458c7344bee04a517f48dd162e2e97a7c1a349f64e.png",
    tintClassName: "bg-[#0A0D12] text-white",
    imageClassName: "object-cover object-center",
    previewAspectClassName: "aspect-[4/5]",
    spanClassName: "xl:col-span-3",
  },
  {
    id: "typographic-tech",
    label: "Type",
    title: "Typographic tech",
    description: "Desktop-first typography system with stronger web attitude.",
    imageUrl: "https://static.stage-images.emergentagent.com/jobs/88843593-1129-446d-9f5c-c55bc360aeb3/images/a1f21d0be9353d958855d05a9e6636e64174f896d0940523b09ca3484b0c9d83.png",
    tintClassName: "bg-[#090B10] text-white",
    imageClassName: "object-cover object-center",
    previewAspectClassName: "aspect-[4/5]",
    spanClassName: "xl:col-span-3",
  },
];


export const AuthShowcaseWall = () => {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1320px]" data-testid="auth-showcase-wall">
      <div className="mb-8 text-center md:mb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.36em] text-zinc-500" data-testid="auth-showcase-label">
          Website preview themes
        </p>
        <h2 className="mx-auto mt-4 max-w-4xl font-heading text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl" data-testid="auth-showcase-title">
          Curated desktop website directions that feel closer to real theme previews.
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base" data-testid="auth-showcase-description">
          Wider browser-like previews, calmer spacing, and a cleaner web-first composition that supports the premium login experience.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6 xl:gap-5" data-testid="auth-showcase-grid">
        {authThemes.map((theme) => (
          <article
            key={theme.id}
            className={cn(
              "auth-theme-card premium-hover-card rounded-[2rem] border border-white/10 p-3 md:p-4 xl:h-full",
              theme.tintClassName,
              theme.spanClassName
            )}
            data-testid={`auth-showcase-card-${theme.id}`}
          >
            <div className="flex h-full flex-col">
              <div className="overflow-hidden rounded-[1.45rem] border border-black/10 bg-black/5 shadow-[0_22px_50px_rgba(0,0,0,0.18)]">
                <div className={cn("overflow-hidden", theme.previewAspectClassName)}>
                <img
                  src={theme.imageUrl}
                  alt={theme.title}
                  className={cn("h-full w-full transition-transform duration-500 hover:scale-[1.03]", theme.imageClassName)}
                  loading="lazy"
                  data-testid={`auth-showcase-image-${theme.id}`}
                />
                </div>
              </div>

              <div className="mt-4 px-1">
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.34em]",
                    theme.tintClassName.includes("text-white") ? "text-white/60" : "text-zinc-600"
                  )}
                  data-testid={`auth-showcase-card-label-${theme.id}`}
                >
                  {theme.label}
                </p>
                <h3 className="mt-2 font-heading text-xl font-semibold tracking-[-0.03em]" data-testid={`auth-showcase-card-title-${theme.id}`}>
                  {theme.title}
                </h3>
                <p
                  className={cn(
                    "mt-2 text-sm leading-6",
                    theme.tintClassName.includes("text-white") ? "text-white/72" : "text-zinc-700"
                  )}
                  data-testid={`auth-showcase-card-description-${theme.id}`}
                >
                  {theme.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};