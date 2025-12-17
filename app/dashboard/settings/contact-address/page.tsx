"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Loader2, MapPin, Globe, Building, Home } from "lucide-react"
import { useToast } from "@/app/hooks/use-toast"
import type { ICountry, IState, ICity, IArea } from "@/app/lib/models/location"

type LocationType = "countries" | "states" | "cities" | "areas"

export default function ContactAddressPage() {
  const { toast } = useToast()
  const [countries, setCountries] = useState<ICountry[]>([])
  const [states, setStates] = useState<IState[]>([])
  const [cities, setCities] = useState<ICity[]>([])
  const [areas, setAreas] = useState<IArea[]>([])

  const [activeTab, setActiveTab] = useState<LocationType>("countries")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({ name: "", code: "", parentId: "" })
  const [loading, setLoading] = useState(true)
  const [dialogLoading, setDialogLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [countriesRes, statesRes, citiesRes, areasRes] = await Promise.all([
        fetch("/api/locations/countries"),
        fetch("/api/locations/states"),
        fetch("/api/locations/cities"),
        fetch("/api/locations/areas"),
      ])

      const [countriesData, statesData, citiesData, areasData] = await Promise.all([
        countriesRes.json(),
        statesRes.json(),
        citiesRes.json(),
        areasRes.json(),
      ])

      if (countriesData.success) setCountries(countriesData.data)
      if (statesData.success) setStates(statesData.data)
      if (citiesData.success) setCities(citiesData.data)
      if (areasData.success) setAreas(areasData.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch location data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({ name: "", code: "", parentId: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    let parentId = ""
    if (activeTab === "states" && item.country) parentId = item.country._id || item.country
    if (activeTab === "cities" && item.state) parentId = item.state._id || item.state
    if (activeTab === "areas" && item.city) parentId = item.city._id || item.city

    setFormData({
      name: item.name,
      code: item.code || "",
      parentId: parentId,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (type: LocationType, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/locations/${type}/${id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: `${type.slice(0, -1)} deleted successfully.` })
        fetchData()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to delete ${type.slice(0, -1)}.`, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setDialogLoading(true)
    const method = editingItem ? "PUT" : "POST"
    const url = editingItem ? `/api/locations/${activeTab}/${editingItem._id}` : `/api/locations/${activeTab}`

    const body: any = { name: formData.name }
    if (activeTab === "countries") {
      body.code = formData.code
    } else if (activeTab === "states") {
      body.countryId = formData.parentId
    } else if (activeTab === "cities") {
      body.stateId = formData.parentId
    } else if (activeTab === "areas") {
      body.cityId = formData.parentId
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `${activeTab.slice(0, -1)} ${editingItem ? "updated" : "created"} successfully.`,
        })
        setIsDialogOpen(false)
        resetFormData()
        fetchData()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? "update" : "create"} ${activeTab.slice(0, -1)}.`,
        variant: "destructive",
      })
    } finally {
      setDialogLoading(false)
    }
  }

  const resetFormData = () => {
    setFormData({ name: "", code: "", parentId: "" })
  }

  const getParentOptions = () => {
    switch (activeTab) {
      case "states":
        return countries
      case "cities":
        return states
      case "areas":
        return cities
      default:
        return []
    }
  }

  const getParentName = (item: any) => {
    switch (activeTab) {
      case "states":
        return (item.country as ICountry)?.name || ""
      case "cities":
        return (item.state as IState)?.name || ""
      case "areas":
        return (item.city as ICity)?.name || ""
      default:
        return ""
    }
  }

  const getCurrentTabData = () => {
    switch (activeTab) {
      case "countries":
        return countries
      case "states":
        return states
      case "cities":
        return cities
      case "areas":
        return areas
      default:
        return []
    }
  }

  const getTabIcon = (tab: LocationType) => {
    switch (tab) {
      case "countries":
        return <Globe className="h-4 w-4" />
      case "states":
        return <Building className="h-4 w-4" />
      case "cities":
        return <MapPin className="h-4 w-4" />
      case "areas":
        return <Home className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold text-gray-900">Location Management</h1>
          </div>
          <p className="text-gray-600">Manage countries, states, cities, and areas for your contact addresses</p>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50/50">
            <CardTitle className="text-lg font-medium text-gray-900">Location Hierarchy</CardTitle>
            <CardDescription className="text-gray-600">
              Organize your geographical data in a structured hierarchy
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LocationType)}>
              <div className="border-b border-gray-200 bg-white">
                <TabsList className="h-auto p-0 bg-transparent w-full justify-start rounded-none">
                  {["countries", "states", "cities", "areas"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="flex items-center gap-2 px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-medium"
                    >
                      {getTabIcon(tab as LocationType)}
                      <span className="capitalize">{tab}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {["countries", "states", "cities", "areas"].map((tab) => (
                <TabsContent key={tab} value={tab} className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 capitalize">{tab}</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage your {tab} data</p>
                    </div>
                    <Button
                      onClick={handleAdd}
                      className="bg-teal-800 hover:bg-teal-700 text-white shadow-sm px-6 py-3 h-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add {tab.slice(0, -1)}
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center h-64 bg-white rounded-lg border border-gray-200">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600">Loading {tab}...</p>
                      </div>
                    </div>
                  ) : getCurrentTabData().length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        {getTabIcon(tab as LocationType)}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No {tab} found</h3>
                      <p className="text-gray-600 mb-4">Get started by adding your first {tab.slice(0, -1)}</p>
                      <Button
                        onClick={handleAdd}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent px-6 py-3 h-auto"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add {tab.slice(0, -1)}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="font-medium text-gray-900">Name</TableHead>
                            {tab === "countries" && <TableHead className="font-medium text-gray-900">Code</TableHead>}
                            {tab !== "countries" && <TableHead className="font-medium text-gray-900">Parent</TableHead>}
                            <TableHead className="font-medium text-gray-900 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCurrentTabData().map((item: any, index) => (
                            <TableRow
                              key={item._id}
                              className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                            >
                              <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                              {tab === "countries" && (
                                <TableCell className="text-gray-600 font-mono text-sm">{item.code}</TableCell>
                              )}
                              {tab !== "countries" && (
                                <TableCell className="text-gray-600">{getParentName(item)}</TableCell>
                              )}
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(item)}
                                    className="h-8 w-8 p-0 border-gray-300 hover:border-primary hover:text-primary"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(activeTab, item._id)}
                                    className="h-8 w-8 p-0 border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="pb-4 border-b border-gray-200">
              <DialogTitle className="text-lg font-medium text-gray-900">
                {editingItem ? "Edit" : "Add"} {activeTab.slice(0, -1)}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingItem ? "Update the" : "Create a new"} {activeTab.slice(0, -1)} entry
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-900">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={`Enter ${activeTab.slice(0, -1)} name`}
                  className="border-gray-300 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              {activeTab === "countries" && (
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-gray-900">
                    Country Code
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="Enter country code (e.g., IN, US)"
                    className="border-gray-300 focus:border-primary focus:ring-primary font-mono"
                    required
                  />
                </div>
              )}
              {activeTab !== "countries" && (
                <div className="space-y-2">
                  <Label htmlFor="parent" className="text-sm font-medium text-gray-900">
                    {activeTab === "states" ? "Country" : activeTab === "cities" ? "State" : "City"}
                  </Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, parentId: value }))}
                    required
                  >
                    <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue
                        placeholder={`Select ${
                          activeTab === "states" ? "country" : activeTab === "cities" ? "state" : "city"
                        }`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getParentOptions().map((option: any) => (
                        <SelectItem key={option._id} value={option._id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={dialogLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 h-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={dialogLoading}
                className="bg-teal-800 hover:bg-teal-700 text-white px-6 py-3 h-auto"
              >
                {dialogLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
