"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, type MouseEvent } from "react"
import { useRouter } from "next/navigation"
import { FaTruck, FaBars, FaTimes } from "react-icons/fa"
import CartDrawer from "@/components/CartDrawer"
import { useCart } from "@/components/context/CartContext"
import { useWishlist } from "@/components/context/WishlistContext"
import { getImageUrl } from "@/app/lib/utils"

interface ICategory {
  _id: string
  name: string
  slug?: string
  title?: string
  description?: string
  images?: string
  isActive?: boolean
}

const Header = () => {
  const { cartCount, isOpen: isCartOpen, openCart, closeCart } = useCart()
  const { wishlistCount } = useWishlist()
  const router = useRouter()

  const [categories, setCategories] = useState<ICategory[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("")

  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchHeaderCategory = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/categories`)

        if (!res.ok) {
          throw new Error(`Failed to fetch header category: ${res.status}`)
        }

        const data = await res.json()
        const categoryList = Array.isArray(data) ? data : data.categories || []
        setCategories(categoryList)
      } catch (error) {
        console.error("Failed to fetch header category:", error)
        setError("Failed to load category")
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeaderCategory()
  }, [])

  // ✅ Debounced Search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
        doSearch(searchTerm.trim())
        setShowSearchResults(true)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // ✅ Close search when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".search-container")) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("click", handleClick as any)
    return () => document.removeEventListener("click", handleClick as any)
  }, [])

  // ✅ Search API
  const doSearch = async (term: string) => {
    setIsSearching(true)
    try {
      const qp = new URLSearchParams({ search: term }).toString()
      const res = await fetch(`/api/products?${qp}`)
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()

      const filteredProducts = (data.products || []).filter((product: any) =>
        product.name.toLowerCase().includes(term.toLowerCase()),
      )

      setSearchResults(filteredProducts)
    } catch (err) {
      console.error("Search error", err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchResultClick = (productSlug: string) => {
    setShowSearchResults(false)
    setSearchTerm("")
    setSearchResults([])
    router.push(`/products/${productSlug}`)
  }

  return (
    <>
      <header className="w-full bg-white">
        {/* Topbar - Better mobile text sizing and padding */}
        <div className="bg-teal-800 text-white text-xs sm:text-sm py-2 flex justify-center items-center gap-1.5 sm:gap-2 px-2 text-center">
          <FaTruck className="text-white flex-shrink-0 text-sm sm:text-base" />
          <span className="leading-tight">Unlocking Global Shopping with Free World Wide Shipping</span>
        </div>

        {/* Main Header - Improved mobile layout and spacing */}
        <div className="shadow-md pt-2 pb-2">
          <div className="max-w-7xl mx-auto grid grid-cols-[auto_1fr_auto] sm:grid-cols-3 items-center gap-2 sm:gap-4 pt-2 sm:pt-4 py-2 px-2 sm:px-4 md:px-6">
            {/* Left - Menu + Links */}
            <div className="flex items-center">
              <div className="md:hidden">
                <button
                  className="text-2xl text-teal-800 p-2 -ml-2 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                  {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
              </div>

              <div className="hidden md:flex gap-2 lg:gap-2 items-center">
                <Link
                  href="/"
                  className="rounded-md px-2 lg:px-4 py-1 lg:py-2 text-sm lg:text-base font-medium transition-colors text-black hover:text-teal-800"
                >
                  Home
                </Link>

                {categories.slice(0, 2).map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/categories/${cat.slug}`}
                    onClick={() => setActiveTab(cat.slug || "")}
                    className={`rounded-md px-2 lg:px-4 py-1 lg:py-2 text-sm lg:text-base font-medium transition-colors ${
                      activeTab === cat.slug ? "bg-teal-800 text-white" : "text-black hover:text-teal-800"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}

                <Link
                  href="/about"
                  className="rounded-md px-2 lg:px-4 py-1 lg:py-2 text-sm lg:text-base font-medium transition-colors text-black hover:text-teal-800"
                >
                  About Us
                </Link>
              </div>
            </div>

            {/* Center - Logo - Responsive logo sizing */}
            <div className="flex justify-center">
              <Link href="/">
                <div className="relative w-[100px] h-[38px] sm:w-[130px] sm:h-[50px] md:w-[150px] md:h-[58px]">
                  <Image src="/logo.jpg" alt="Logo" fill className="object-contain" priority />
                </div>
              </Link>
            </div>

            {/* Right - Search + Icons - Better mobile icon spacing and sizes */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 justify-end">
              {/* Search - Fixed visibility: now shows on small screens and above (desktop) */}
              <div className="relative search-container hidden sm:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-200 rounded-lg py-1.5 sm:py-2 px-3 sm:px-4 pr-8 sm:pr-10 w-28 sm:w-40 md:w-56 lg:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:shadow-md focus:bg-white text-gray-700 placeholder-gray-400"
                  />
                  <svg
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Loading */}
                {isSearching && (
                  <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-teal-500 text-sm animate-pulse">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}

                {/* Search Results - Better mobile dropdown positioning and sizing */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-[90vw] sm:w-72 md:w-80 right-0 sm:right-auto z-50 max-h-[60vh] sm:max-h-96 overflow-y-auto">
                    {searchResults.map((prod) => (
                      <div
                        key={prod._id}
                        onClick={() => handleSearchResultClick(prod.slug)}
                        className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 active:bg-gray-200 transition-colors"
                      >
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                          <Image
                            src={getImageUrl(prod.images?.[0] || "")}
                            alt={prod.name}
                            width={48}
                            height={48}
                            className="rounded object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = `/placeholder.svg?height=48&width=48&query=${encodeURIComponent(prod.name)}`
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{prod.name}</h4>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-red-600">
                              ₹{prod.total_price.toLocaleString()}
                            </span>
                            {prod.oldPrice && (
                              <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                                ₹{prod.oldPrice.toLocaleString()}
                              </span>
                            )}
                            {prod.discount && (
                              <span className="text-[10px] sm:text-xs bg-green-100 text-green-600 px-1 py-0.5 rounded">
                                {prod.discount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist - Better mobile icon sizing and touch targets */}
              <Link
                href="/wishlist"
                className="relative p-1.5 sm:p-2 -mr-1.5 sm:mr-0 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="currentColor"
                    d="M19.47,7.07a4.96,4.96,0,0,0-4.12-2.14A4.44,4.44,0,0,0,12,6a4.45,4.45,0,0,0-3.35-1.07A4.96,4.96,0,0,0,4.53,7.07a5.06,5.06,0,0,0-.22,5.02,12.8,12.8,0,0,0,2.51,3.71,28.13,28.13,0,0,0,3.88,3.38,2.21,2.21,0,0,0,2.6,0,28.06,28.06,0,0,0,3.88-3.38A12.8,12.8,0,0,0,19.69,12.09,5.06,5.06,0,0,0,19.47,7.07Zm-.79,4.6a12,12,0,0,1-2.3,3.38,27.26,27.26,0,0,1-3.72,3.24,1.08,1.08,0,0,1-1.3,0,27.36,27.36,0,0,1-3.72-3.24A11.7,11.7,0,0,1,5.34,11.3a4.06,4.06,0,0,1,.12-4A3.85,3.85,0,0,1,8.65,5.68a3.36,3.36,0,0,1,2.69,1.2.97.97,0,0,0,1.34,0,3.36,3.36,0,0,1,2.66-1.2,3.85,3.85,0,0,1,3.2,1.63A4.06,4.06,0,0,1,18.68,11.67Z"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] sm:text-xs rounded-full min-w-[16px] sm:min-w-[18px] h-4 sm:h-[18px] flex items-center justify-center px-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Login - Better mobile sizing and touch targets */}
              <Link
                href="/login"
                className="p-1.5 sm:p-2 -mr-1.5 sm:mr-0 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 6a4 4 0 118 0 4 4 0 01-8 0zm4-5.33a5.33 5.33 0 100 10.66 5.33 5.33 0 000-10.66zm7.44 16.2c1.49 1.09 2.44 2.99 2.55 6.46H2.01c.11-3.47 1.05-5.37 2.53-6.46C6.21 15.67 8.67 15.33 12 15.33s5.8.34 7.44 1.54zM12 14c-3.33 0-6.2.32-8.23 1.8C1.69 17.31.67 19.91.67 24v.67h22.66V24c0-4.09-1.03-6.69-3.1-8.2C18.2 14.32 15.33 14 12 14z"
                    fill="currentColor"
                  />
                </svg>
              </Link>

              {/* Cart - Better mobile sizing and touch targets */}
              <div
                className="relative cursor-pointer p-1.5 sm:p-2 -mr-1.5 sm:mr-0 hover:bg-gray-100 rounded-md transition-colors"
                onClick={openCart}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                  aria-hidden="true"
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="m9.45 7.08h-1.9l-.46 6.96a3 3 0 0 0 2.99 3.2h4.43a3 3 0 0 0 2.99-3.2l-.47-6.96zm0 .6h-1.33l-.43 6.4a2.4 2.4 0 0 0 2.39 2.56h4.43a2.4 2.4 0 0 0 2.4-2.56l-.43-6.4h-1.33v.38a2.85 2.85 0 1 1 -5.7 0zm5.1 0h-4.5v.38a2.25 2.25 0 1 0 4.5 0z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] sm:text-xs rounded-full min-w-[16px] sm:min-w-[18px] h-4 sm:h-[18px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        {categories.length > 2 && (
          <div className="bg-gray-100 text-gray-800 border-t border-b border-gray-200">
            <div className="hidden md:flex justify-center gap-6 lg:gap-12 text-sm lg:text-[17px] capitalize py-2 lg:py-3 max-w-7xl mx-auto flex-wrap">
              {categories.slice(2).map((cat) => (
                <Link
                  key={cat._id}
                  href={`/categories/${cat.slug}`}
                  className="hover:text-teal-700 transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Mobile Menu - Better mobile menu styling and scrolling */}
            {menuOpen && (
              <div className="md:hidden flex flex-col bg-white shadow-lg border-t max-h-[calc(100vh-180px)] overflow-y-auto">
                <div className="xs:hidden p-4 pb-0">
                  <div className="relative search-container">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-200 rounded-lg py-2 px-4 pr-10 w-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    />
                    <svg
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>

                    {/* Mobile Search Results */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-full z-50 max-h-60 overflow-y-auto">
                        {searchResults.map((prod) => (
                          <div
                            key={prod._id}
                            onClick={() => {
                              handleSearchResultClick(prod.slug)
                              setMenuOpen(false)
                            }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 active:bg-gray-200"
                          >
                            <div className="relative w-10 h-10 flex-shrink-0">
                              <Image
                                src={getImageUrl(prod.images?.[0] || "")}
                                alt={prod.name}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(prod.name)}`
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-medium text-gray-900 truncate">{prod.name}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-semibold text-red-600">
                                  ₹{prod.total_price.toLocaleString()}
                                </span>
                                {prod.oldPrice && (
                                  <span className="text-[10px] text-gray-500 line-through">
                                    ₹{prod.oldPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-1">
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="font-medium text-left py-3 px-3 rounded-md transition-colors text-black hover:bg-gray-50 active:bg-gray-100"
                  >
                    Home
                  </Link>

                  {categories.slice(0, 2).map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/categories/${cat.slug}`}
                      onClick={() => {
                        setActiveTab(cat.slug || "")
                        setMenuOpen(false)
                      }}
                      className={`font-medium text-left py-3 px-3 rounded-md transition-colors ${
                        activeTab === cat.slug
                          ? "text-teal-800 bg-teal-50"
                          : "text-black hover:bg-gray-50 active:bg-gray-100"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}

                  <Link
                    href="/about"
                    onClick={() => setMenuOpen(false)}
                    className="font-medium text-left py-3 px-3 rounded-md transition-colors text-black hover:bg-gray-50 active:bg-gray-100"
                  >
                    About Us
                  </Link>

                  {categories.length > 2 && (
                    <div className="border-t pt-2 mt-2 flex flex-col gap-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                        Categories
                      </div>
                      {categories.slice(2).map((cat) => (
                        <Link
                          key={cat._id}
                          href={`/categories/${cat.slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="font-medium text-left py-3 px-3 rounded-md transition-colors text-gray-600 hover:text-black hover:bg-gray-50 active:bg-gray-100"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  )
}

export default Header
