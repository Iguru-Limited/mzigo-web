"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRScanner } from "@/components/lookup/qr-scanner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

type TabType = "scan" | "search";

export function ExpressManager() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("scan");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (decodedText: string) => {
    router.push(`/express/result?q=${encodeURIComponent(decodedText)}`);
    setIsScanning(false);
  };

  const handleScanError = (error: string) => {
    console.error("❌ Express Scan Error:", error);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/express/result?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Express</h1>
        <p className="text-muted-foreground">
          Scan or search for express packages
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("scan")}
          className={`px-4 py-2 hover:cursor-pointer font-medium transition-colors ${
            activeTab === "scan"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FontAwesomeIcon icon={faQrcode} className="mr-2" />
          Scan
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 font-medium transition-colors hover:cursor-pointer ${
            activeTab === "search"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
          Search
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "scan" && (
          <Card className="p-6 max-w-md">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Scan QR Code</h2>
                <p className="text-sm text-muted-foreground">
                  Scan the QR code on the express package
                </p>
              </div>

              {!isScanning ? (
                <Button onClick={() => setIsScanning(true)} size="lg" >
                  <FontAwesomeIcon icon={faQrcode} className="mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <div className="space-y-4">
                  <QRScanner onScan={handleScan} onError={handleScanError} />
                  <Button
                    variant="outline"
                    onClick={() => setIsScanning(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === "search" && (
          <Card className="p-6 max-w-md">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Search Express Package</h2>
                <p className="text-sm text-muted-foreground">
                  Enter tracking number or package details
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter tracking number or search query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <Button onClick={handleSearch} className="w-full">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
