import {
  Plane,
  RefreshCcw,
  Headset,
  CreditCard,
} from "lucide-react"

export default function ShippingInfo() {
  const features = [
    {
      icon: <Plane className="w-8 h-8" />,
      title: "FREE SHIPPING",
      description: "Free shipping on all order in India",
    },
    {
      icon: <RefreshCcw className="w-8 h-8" />,
      title: "EASY RETURN & EXCHANGE",
      description: "2days Easy return & Exchange available",
    },
    {
      icon: <Headset className="w-8 h-8" />,
      title: "CUSTOMER SUPPORT",
      description: "Monday to Saturday 11am to 6pm",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "100% PAYMENT SECURE",
      description: "We ensure 128 bit SSL secure payment",
    },
  ]

  return (
    <section className="bg-[#e4ebf2] py-10 px-4 sm:px-12 mt-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-black text-sm">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="text-black">{feature.icon}</div>
            <div>
              <h4 className="font-semibold">{feature.title}</h4>
              <p className="text-sm mt-1 text-black/80 leading-tight">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
