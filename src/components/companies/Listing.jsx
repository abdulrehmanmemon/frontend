import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseCompanies } from "../../helpers/supabaseClient";
import RenderTable from "../reuseable/RenderTable";
import { debounce } from "lodash";
import Input from "@/components/daisyui/Input/Input";
import Button from "@/components/daisyui/Button/Button";

const Listing = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, [search, page]);

  const fetchCompanies = async () => {
    setLoading(true);
    let query = supabaseCompanies
      .from("company")
      .select("company_id, name, industry, ae_name, segment")
      .ilike("name", `%${search}%`)
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error } = await query;

    if (error) console.error("Error fetching companies:", error);
    else setCompanies(data);

    setLoading(false);
  };

  const handleRowClick = (row) => {
    router(`/companies/${row.company_id}`);
  };

  const handleSearchChange = debounce((value) => {
    setSearch(value);
    setPage(1); 
  }, 300);

  const columns = [
    { label: "Company Name", key: "name" },
    { label: "Industry", key: "industry" },
    { label: "AE Name", key: "ae_name" },
    { label: "Segment", key: "segment" },
  ];

  return (
    <div className="p-4 bg-white">
      <Input
        type="text"
        placeholder="Search companies..."
        className="input-bordered w-1/2 mb-4"
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <RenderTable
        columns={columns}
        data={companies}
        onRowClick={handleRowClick}
      />
      <div className="flex justify-between mt-6">
        <Button
        color="secondary"
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        >
          Previous
          </Button>
      
        <span className="text-sm">Page {page}</span>
        <Button
          color="secondary"
          variant="outline"
          size="sm"
          disabled={companies.length < pageSize}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Listing;
