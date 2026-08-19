import catSprite from "@/assets/pepperino.png.asset.json";
import sleepSprite from "@/assets/sleep.png.asset.json";
import typingClip from "@/assets/typing.mp4.asset.json";

export type CatPose = "idle" | "type" | "sleep";

/**
 * The cat. Source art is a black pixel cat on white, so she is always shown
 * on her own white tile — no inversion, no blend modes: the original black cat.
 */
export function PixelCat({
  pose = "idle",
  size = 128,
  className = "",
  flip = false,
}: {
  pose?: CatPose;
  size?: number;
  className?: string;
  flip?: boolean;
}) {
  const media: React.CSSProperties = {
    width: size,
    height: "auto",
    imageRendering: "pixelated",
    display: "block",
    transform: flip ? "scaleX(-1)" : undefined,
  };

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        backgroundColor: "#fff",
        lineHeight: 0,
      }}
    >
      {pose === "type" ? (
        <video
          style={media}
          src={typingClip.url}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
      ) : (
        <img
          style={media}
          src={pose === "sleep" ? sleepSprite.url : catSprite.url}
          width={size}
          alt=""
          aria-hidden="true"
        />
      )}
    </span>
  );
}
