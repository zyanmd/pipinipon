"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Trash2 } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface AdminUsersProps {
  users: any[]
  pagination: any
  searchTerm: string
  setSearchTerm: (term: string) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  onRefresh: () => void
}

export function AdminUsers({ 
  users, 
  pagination, 
  searchTerm, 
  setSearchTerm, 
  currentPage, 
  setCurrentPage,
  onRefresh 
}: AdminUsersProps) {
  const handleUpdateUserRole = async (username: string, role: string) => {
    try {
      await adminAPI.changeUserRole(username, role)
      toast({ title: "Success", description: `User role updated to ${role}` })
      onRefresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to update role", variant: "destructive" })
    }
  }

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return
    try {
      await adminAPI.deleteUser(username)
      toast({ title: "Success", description: "User deleted successfully" })
      onRefresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to delete user", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Manajemen Pengguna</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari pengguna..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-9" 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select defaultValue={u.role} onValueChange={(v) => handleUpdateUserRole(u.username, v)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.is_verified === 1 ? (
                      <Badge variant="default" className="bg-green-500">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell>{u.xp || 0}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteUser(u.username)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(currentPage - 1)}  // ← Langsung kurangi currentPage
            >
              Previous
            </Button>
            <span className="py-2 px-3 text-sm">Page {currentPage} of {pagination.pages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === pagination.pages} 
              onClick={() => setCurrentPage(currentPage + 1)}  // ← Langsung tambah currentPage
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}