<script lang="ts">
  import type { PlantArt } from '#lib/types';

  let { art, color }: { art: PlantArt; color: string } = $props();
</script>

<svg viewBox="0 0 200 130" aria-hidden="true" focusable="false">
  <rect width="200" height="130" rx="10" fill="#f6e8d1" />
  <circle cx="160" cy="20" r="46" fill="#e2e9d4" opacity=".85" />
  <ellipse cx="100" cy="119" rx="46" ry="6" fill="#202a24" opacity=".09" />

  {#if art === 'upright'}
    <g fill={color}>
      <path d="M97 101 C86 80 84 52 92 30 C100 50 100 80 100 101 Z" />
      <path d="M103 101 C114 78 116 50 108 28 C100 48 100 78 100 101 Z" fill="#1f3a2a" opacity=".18" />
      <path d="M88 101 C76 84 68 64 70 46 C82 62 88 82 93 101 Z" fill="#1f3a2a" opacity=".12" />
      <path d="M112 101 C124 82 132 62 130 44 C118 62 112 82 107 101 Z" />
    </g>
    <g stroke="#f4ecd2" stroke-width="1.1" opacity=".32" fill="none">
      <path d="M95 96 C94 76 93 54 94 38" />
      <path d="M106 96 C107 76 108 54 107 38" />
    </g>
  {:else if art === 'stems'}
    <g stroke={color} stroke-width="2.4" fill="none" stroke-linecap="round">
      <path d="M100 101 C98 84 96 64 92 44" />
      <path d="M100 101 C104 82 108 62 112 42" />
      <path d="M100 101 C94 86 86 70 78 58" />
    </g>
    <g fill={color}>
      <ellipse cx="92" cy="46" rx="9" ry="5" transform="rotate(-28 92 46)" />
      <ellipse cx="88" cy="56" rx="9" ry="5" transform="rotate(28 88 56)" fill="#1f3a2a" opacity=".16" />
      <ellipse cx="112" cy="44" rx="9" ry="5" transform="rotate(28 112 44)" />
      <ellipse cx="116" cy="54" rx="9" ry="5" transform="rotate(-28 116 54)" fill="#1f3a2a" opacity=".16" />
      <ellipse cx="78" cy="60" rx="8" ry="4.5" transform="rotate(-20 78 60)" />
      <ellipse cx="74" cy="70" rx="8" ry="4.5" transform="rotate(20 74 70)" fill="#1f3a2a" opacity=".16" />
    </g>
  {:else if art === 'rosette'}
    <g fill={color}>
      <path d="M100 102 C70 96 58 74 62 52 C84 62 96 80 100 102 Z" />
      <path d="M100 102 C130 96 142 74 138 52 C116 62 104 80 100 102 Z" fill="#1f3a2a" opacity=".16" />
      <path d="M100 102 C78 88 72 62 82 42 C94 62 98 84 100 102 Z" />
      <path d="M100 102 C122 88 128 62 118 42 C106 62 102 84 100 102 Z" fill="#1f3a2a" opacity=".12" />
      <path d="M100 102 C94 78 96 52 100 34 C104 52 106 78 100 102 Z" />
    </g>
    <g stroke="#f1ead1" stroke-width="1" opacity=".28" fill="none">
      <path d="M100 98 C90 80 78 66 67 58" />
      <path d="M100 98 C110 80 122 66 133 58" />
      <path d="M100 98 V42" />
    </g>
  {:else if art === 'trailing'}
    <g fill={color}>
      <ellipse cx="86" cy="88" rx="8" ry="5.5" transform="rotate(-30 86 88)" />
      <ellipse cx="66" cy="80" rx="8" ry="5.5" transform="rotate(-20 66 80)" fill="#1f3a2a" opacity=".14" />
      <ellipse cx="52" cy="70" rx="8" ry="5.5" transform="rotate(-15 52 70)" />
      <ellipse cx="124" cy="86" rx="8" ry="5.5" transform="rotate(30 124 86)" />
      <ellipse cx="140" cy="77" rx="8" ry="5.5" transform="rotate(20 140 77)" fill="#1f3a2a" opacity=".14" />
      <ellipse cx="149" cy="66" rx="8" ry="5.5" transform="rotate(15 149 66)" />
      <ellipse cx="94" cy="74" rx="7" ry="5" transform="rotate(-12 94 74)" />
      <ellipse cx="96" cy="60" rx="7" ry="5" transform="rotate(10 96 60)" fill="#1f3a2a" opacity=".14" />
    </g>
  {:else if art === 'cactus'}
    <g fill={color} stroke={color} stroke-linecap="round">
      <rect x="88" y="46" width="24" height="58" rx="12" stroke-width="0" />
      <path d="M88 82 H78 a7 7 0 0 1 -7 -7 V64" fill="none" stroke-width="11" />
      <path d="M112 76 h8 a7 7 0 0 0 7 -7 V56" fill="none" stroke-width="10" />
    </g>
    <g stroke="#f2ead2" stroke-width="1" opacity=".45" stroke-linecap="round">
      <path d="M93 58 l-3 -4" /><path d="M107 64 l3 -4" /><path d="M94 72 l-3 -4" />
      <path d="M106 84 l3 -4" /><path d="M94 90 l-3 -4" /><path d="M107 96 l3 -4" />
      <path d="M73 70 l-4 -2" /><path d="M126 66 l4 -2" />
    </g>
    <circle cx="100" cy="43" r="4.5" fill="#d9a05b" />
  {:else if art === 'fern'}
    <g fill={color}>
      <path d="M100 101 C92 80 72 64 50 60 C64 80 84 96 100 101 Z" />
      <path d="M100 101 C108 80 128 64 150 60 C136 80 116 96 100 101 Z" fill="#1f3a2a" opacity=".14" />
      <path d="M100 101 C88 76 70 54 46 42 C62 66 84 92 100 101 Z" />
      <path d="M100 101 C112 76 130 54 154 42 C138 66 116 92 100 101 Z" fill="#1f3a2a" opacity=".1" />
      <path d="M100 101 C96 76 96 54 100 34 C104 54 104 76 100 101 Z" />
    </g>
    <g stroke="#f1ead1" stroke-width="1" opacity=".24" fill="none">
      <path d="M100 98 L56 63" /><path d="M100 98 L144 63" />
      <path d="M100 98 L52 48" /><path d="M100 98 L148 48" /><path d="M100 98 V40" />
    </g>
  {:else if art === 'orchid'}
    <g fill={color}>
      <ellipse cx="86" cy="98" rx="17" ry="8" transform="rotate(-16 86 98)" />
      <ellipse cx="114" cy="98" rx="17" ry="8" transform="rotate(16 114 98)" fill="#1f3a2a" opacity=".12" />
    </g>
    <path d="M100 98 C92 78 96 54 108 40" stroke="#5f7a4a" stroke-width="2" fill="none" />
    <g fill="#d98ca0">
      <circle cx="108" cy="30" r="4.5" /><circle cx="115" cy="35" r="4.5" />
      <circle cx="113" cy="43" r="4.5" /><circle cx="103" cy="43" r="4.5" />
      <circle cx="101" cy="35" r="4.5" />
      <circle cx="97" cy="55" r="3.4" /><circle cx="102" cy="60" r="3.4" />
      <circle cx="100" cy="66" r="3" /><circle cx="96" cy="61" r="3.4" />
    </g>
    <circle cx="108" cy="37" r="2" fill="#e0b06a" />
    <circle cx="99" cy="59" r="1.6" fill="#e0b06a" />
  {:else}
    <g fill={color}>
      <path d="M100 101 C90 78 74 58 54 48 C64 72 82 94 100 101 Z" />
      <path d="M100 101 C110 78 126 58 146 48 C136 72 118 94 100 101 Z" fill="#1f3a2a" opacity=".15" />
      <path d="M100 101 C84 84 64 74 44 74 C60 88 82 98 100 101 Z" />
      <path d="M100 101 C116 84 136 74 156 74 C140 88 118 98 100 101 Z" fill="#1f3a2a" opacity=".12" />
      <path d="M100 101 C94 76 96 54 100 38 C104 54 106 76 100 101 Z" />
    </g>
    <g stroke="#f1ead1" stroke-width="1" opacity=".26" fill="none">
      <path d="M100 98 L58 52" /><path d="M100 98 L142 52" />
      <path d="M100 98 L48 76" /><path d="M100 98 L152 76" /><path d="M100 98 V42" />
    </g>
  {/if}

  <path d="M78 101 H122 L117 125 Q116 128 112 128 H88 Q84 128 83 125 Z" fill="#b98a5e" />
  <rect x="74" y="96" width="52" height="8" rx="3" fill="#c99a6a" />
  <ellipse cx="100" cy="100" rx="20" ry="3" fill="#5b4632" opacity=".55" />

  {#if art === 'trailing'}
    <g stroke={color} stroke-width="2.2" fill="none" stroke-linecap="round">
      <path d="M92 101 C80 88 60 86 47 70" />
      <path d="M108 101 C120 86 138 84 150 66" />
      <path d="M100 101 C96 84 100 70 92 54" />
    </g>
  {/if}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
