"use client"

export default function AboutUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">About us</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-10">
          We are Manufacturer of women clothing Since 2021. We sell only Premium Quality Product in our Store and we
          can not compromise in Quality. So don’t Compare Our rate with any other Seller or Website.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video 1 */}
          <div className="shadow-lg rounded-md overflow-hidden">
            <video
              controls
              width="100%"
              className="w-full h-auto"
              poster="/stich.jpg"
            >
              <source src="https://bannabannistore.com/videos/v1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video 2 */}
          <div className="shadow-lg rounded-md overflow-hidden">
            <video
              controls
              width="100%"
              className="w-full h-auto"
              poster="embriod.jpg"
            >
              <source src="https://bannabannistore.com/videos/v2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
