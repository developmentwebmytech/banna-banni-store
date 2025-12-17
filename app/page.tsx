import Hero from "@/components/Hero";
import ShopByCategory from "@/components/ShopByCategory";
import NewArrival from "@/components/NewArrival";
import Trending from "@/components/Trending";
import ShippingInfo from "@/components/ShippingInfo"
import BestSeller from "@/components/BestSeller";
import CustomerReviews from "@/components/CustomerReviews";
import AboutUs from "@/components/AboutUs";

export default function Home() {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <NewArrival />
      <Trending />
      <ShippingInfo />
      <BestSeller />
      <CustomerReviews/>
      <AboutUs/>
    </>
  );
}
