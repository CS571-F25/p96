import React from "react";

export default function InstagramSection() {
  // TODO: replace with the embed URL you get from Elfsight / SnapWidget / LightWidget
  const WIDGET_URL = "https://a9bc1594d4f447f6b10956ea44df07b2.elf.site";

  return (
    <section className="section">

      {/* Responsive, no scrollbars, blends with UW styles */}
      <div className="ig-widget-wrap card p-0">
        <div className="ig-widget-aspect">
          <iframe
            title="AreaRED Instagram"
            src={WIDGET_URL}
            loading="lazy"
            allowTransparency={true}
            style={{ border: 0, width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </section>
  );
}