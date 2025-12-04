// // src/pages/CostSheet/CostSheetEdit.jsx
// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../../api/axiosInstance";
// import { toast } from "react-hot-toast";
// import "./CostSheetCreate.css"; // Reuse the same styles

// // Import the same SectionCard component
// const SectionCard = ({ title, children, defaultOpen = true }) => {
//   const [open, setOpen] = useState(defaultOpen);

//   return (
//     <section className={`cs-card ${open ? "cs-card-open" : "cs-card-closed"}`}>
//       <button
//         type="button"
//         className="cs-card-header"
//         onClick={() => setOpen((prev) => !prev)}
//       >
//         <h2 className="cs-section-title">{title}</h2>
//         <span className={`cs-chevron ${open ? "cs-chevron-open" : ""}`} />
//       </button>

//       {open && <div className="cs-card-body">{children}</div>}
//     </section>
//   );
// };

// const CostSheetEdit = () => {
//   const { id } = useParams(); // route: /cost-sheets/edit/:id
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [initError, setInitError] = useState("");
//   const [apiErrors, setApiErrors] = useState([]);

//   // ... (All the same state variables as CostSheetCreate.jsx)
//   // Copy all state declarations from CostSheetCreate here

//   const [lead, setLead] = useState(null);
//   const [project, setProject] = useState(null);
//   const [template, setTemplate] = useState(null);
//   const [paymentPlans, setPaymentPlans] = useState([]);
//   const [offers, setOffers] = useState([]);

//   // ... all other state variables ...

//   // ==============================
//   // 1) Load cost sheet for editing
//   // ==============================
//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         setInitError("");

//         // ---- Cost sheet edit endpoint ----
//         const editRes = await api.get(`/costsheet/cost-sheets/${id}/edit/`);
//         const data = editRes.data;

//         // Set context data
//         setLead(data.lead);
//         setProject(data.project);
//         setTemplate(data.template);
//         setPaymentPlans(data.payment_plans || []);
//         setOffers(data.offers || []);

//         // ✅ Pre-fill form with existing cost sheet data
//         const cs = data.cost_sheet;

//         // Header
//         setQuotationDate(cs.date || "");
//         setValidTill(cs.valid_till || "");
//         setStatus(cs.status || "DRAFT");
//         setPreparedBy(cs.prepared_by_name || cs.prepared_by_username || "");

//         // Customer
//         setCustomerName(cs.customer_name || "");
//         setCustomerContactPerson(cs.customer_contact_person || "");
//         setCustomerPhone(cs.customer_phone || "");
//         setCustomerEmail(cs.customer_email || "");

//         // Unit
//         setProjectName(cs.project_name || "");
//         setTowerName(cs.tower_name || "");
//         setFloorNumber(cs.floor_number || "");
//         setUnitNo(cs.unit_no || "");

//         // Base pricing
//         setBaseAreaSqft(cs.base_area_sqft || "");
//         setBaseRatePsf(cs.base_rate_psf || "");

//         // Discount
//         if (cs.discount_amount && cs.discount_amount !== "0.00") {
//           setDiscountType("Fixed");
//           setDiscountValue(cs.discount_amount);
//         } else if (cs.discount_percent && cs.discount_percent !== "0.00") {
//           setDiscountType("Percentage");
//           setDiscountValue(cs.discount_percent);
//         }

//         // Parking
//         if (cs.parking_count && parseInt(cs.parking_count) > 0) {
//           setHasParking(true);
//           setParkingCount(cs.parking_count);
//           setParkingPrice(cs.per_parking_price || "");
//         }

//         // Payment plan
//         if (data.template) {
//           setPlanRequired(data.template.is_plan_required !== false);
//           setIsPossessionCharges(
//             data.template.is_possessional_charges === true
//           );
//           setPossessionGstPercent(
//             parseFloat(data.template.possessional_gst_percent) || 0
//           );
//           setProvisionalMaintenanceMonths(
//             parseInt(data.template.provisional_maintenance_months) || 0
//           );
//           setTermsAndConditions(data.template.terms_and_conditions || "");
//         }

//         // Pre-fill payment plan
//         if (cs.payment_plan_type === "MASTER" && cs.payment_plan) {
//           setPaymentPlanType("MASTER");
//           setSelectedPlanId(cs.payment_plan);
//           // Load slabs from the selected plan
//           const plan = data.payment_plans.find((p) => p.id === cs.payment_plan);
//           if (plan && plan.slabs) {
//             const rows = plan.slabs.map((slab) => ({
//               slab_id: slab.id,
//               name: slab.name,
//               percentage: slab.percentage,
//               due_date: "",
//             }));
//             setPlanRows(rows);
//           }
//         } else if (
//           cs.custom_payment_plan &&
//           Array.isArray(cs.custom_payment_plan)
//         ) {
//           setPaymentPlanType("CUSTOM");
//           setPlanRows(
//             cs.custom_payment_plan.map((row, idx) => ({
//               slab_id: null,
//               name: row.name,
//               percentage: row.percentage,
//               due_date: row.due_date || "",
//             }))
//           );
//         }

//         setTermsAndConditions(cs.terms_and_conditions || "");

//         // Load booking setup for unit selection
//         if (data.booking_setup && data.booking_setup.towers) {
//           // Process towers similar to create page
//           const towersList = data.booking_setup.towers; // Process as needed
//           setTowers(towersList);

//           // Build inventory map
//           const invMap = {};
//           towersList.forEach((t) => {
//             (t.floors || []).forEach((f) => {
//               (f.inventories || []).forEach((inv) => {
//                 invMap[String(inv.inventory_id)] = {
//                   ...inv,
//                   tower_id: t.tower_id,
//                   tower_name: t.tower_name,
//                   floor_id: f.floor_id,
//                   floor_number: f.floor_number,
//                 };
//               });
//             });
//           });
//           setInventoryMap(invMap);

//           // Pre-select the inventory if available
//           if (cs.inventory_id) {
//             setSelectedInventoryId(String(cs.inventory_id));
//             const inv = invMap[String(cs.inventory_id)];
//             if (inv) {
//               setSelectedTowerId(String(inv.tower_id || ""));
//               setSelectedFloorId(String(inv.floor_id || ""));
//             }
//           }
//         }
//       } catch (err) {
//         console.error(err);
//         setInitError("Failed to load cost sheet for editing.");
//         toast.error("Failed to load cost sheet for editing.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       load();
//     }
//   }, [id]);

//   // ==============================
//   // 2) Save (PUT/PATCH)
//   // ==============================
//   const handleSave = async () => {
//     setApiErrors([]);

//     // Same validation as create page
//     if (!lead || !project) {
//       toast.error("Lead / project not loaded.");
//       return;
//     }
//     if (!selectedInventoryId) {
//       toast.error("Please select an inventory/unit.");
//       return;
//     }

//     // ... (same validation logic as create page)

//     // Build payload (same as create page)
//     const customPaymentPlan =
//       planRows.length > 0
//         ? planRows.map((row) => ({
//             name: row.name,
//             percentage: row.percentage,
//             amount:
//               finalAmount && row.percentage
//                 ? (
//                     (finalAmount * parseFloat(row.percentage || 0)) /
//                     100
//                   ).toFixed(2)
//                 : null,
//             due_date: row.due_date || null,
//           }))
//         : null;

//     try {
//       setSaving(true);

//       const payload = {
//         // Same payload structure as create
//         lead_id: lead.id,
//         project_id: project.id,
//         inventory_id: Number(selectedInventoryId),
//         project_template_id: template ? template.project_template_id : null,

//         date: quotationDate,
//         valid_till: validTill,
//         status,

//         customer_name: customerName,
//         customer_contact_person: customerContactPerson,
//         customer_phone: customerPhone,
//         customer_email: customerEmail,

//         project_name: projectName,
//         tower_name: towerName,
//         floor_number: floorNumber,
//         unit_no: unitNo,

//         customer_snapshot: null,
//         unit_snapshot: null,

//         base_area_sqft: baseAreaSqft || null,
//         base_rate_psf: baseRatePsf || null,
//         base_value: baseValue || null,

//         discount_percent: safeDiscountPercent,
//         discount_amount: safeDiscountAmount,

//         net_base_value: netBaseValue || null,

//         payment_plan_type: planRequired ? paymentPlanType : null,
//         payment_plan: planRequired && selectedPlanId ? selectedPlanId : null,
//         custom_payment_plan: planRequired ? customPaymentPlan : null,

//         gst_percent: template ? template.gst_percent : null,
//         gst_amount: gstAmount || null,
//         stamp_duty_percent: template ? template.stamp_duty_percent : null,
//         stamp_duty_amount: stampAmount || null,
//         registration_amount: registrationAmount || null,
//         legal_fee_amount: template?.legal_fee_amount || null,

//         parking_count: hasParking ? Number(parkingCount) || 0 : 0,
//         per_parking_price: hasParking ? parkingPrice || null : null,
//         parking_amount: parkingAmount || null,

//         share_application_money_membership_amount: isPossessionCharges
//           ? membershipAmount || null
//           : null,
//         legal_compliance_charges_amount: isPossessionCharges
//           ? legalComplianceAmount || null
//           : null,
//         development_charges_amount: isPossessionCharges
//           ? developmentChargesAmount || null
//           : null,
//         electrical_water_piped_gas_charges_amount: isPossessionCharges
//           ? electricalChargesAmount || null
//           : null,
//         provisional_maintenance_amount: isPossessionCharges
//           ? provisionalMaintenanceAmount || null
//           : null,
//         possessional_gst_amount: isPossessionCharges
//           ? possessionGstAmount || null
//           : null,

//         additional_charges_total: additionalChargesTotal || null,
//         offers_total: null,
//         net_payable_amount: finalAmount || null,

//         terms_and_conditions: termsAndConditions,
//         notes: "",

//         additional_charges: [],
//         applied_offers: [],
//       };

//       // Use PUT or PATCH
//       const res = await api.put(`/costsheet/cost-sheets/${id}/`, payload);

//       toast.success("Cost Sheet updated successfully.");
//       navigate(`/costsheet/${id}`);
//     } catch (err) {
//       console.error(err);

//       const backendErrors = [];

//       if (err.response && err.response.data) {
//         const data = err.response.data;

//         if (typeof data === "string") {
//           backendErrors.push(data);
//         } else if (typeof data === "object") {
//           if (Array.isArray(data.__all__)) {
//             backendErrors.push(...data.__all__);
//           }
//           if (Array.isArray(data.non_field_errors)) {
//             backendErrors.push(...data.non_field_errors);
//           }

//           Object.keys(data).forEach((key) => {
//             if (key === "__all__" || key === "non_field_errors") return;

//             const value = data[key];
//             if (Array.isArray(value)) {
//               value.forEach((msg) => {
//                 backendErrors.push(`${key}: ${msg}`);
//               });
//             } else if (typeof value === "string") {
//               backendErrors.push(`${key}: ${value}`);
//             }
//           });
//         }
//       }

//       if (backendErrors.length) {
//         setApiErrors(backendErrors);
//         toast.error(backendErrors[0]);
//       } else {
//         toast.error("Failed to update cost sheet.");
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ==============================
//   // RENDER (Same as Create page)
//   // ==============================
//   if (loading) {
//     return <div className="cs-page">Loading...</div>;
//   }

//   if (initError) {
//     return <div className="cs-page">Error: {initError}</div>;
//   }

//   return (
//     <div className="cs-page">
//       <div className="cs-page-inner">
//         {/* Use the same form structure as CostSheetCreate.jsx */}
//         {/* Just change the title and button text */}

//         <h1 className="cs-page-title">Edit Cost Sheet</h1>

//         {/* All sections same as Create page */}
//         <SectionCard title="Quotation Header">{/* ... */}</SectionCard>

//         {/* ... other sections ... */}

//         {/* SAVE BUTTON */}
//         <div className="cs-actions">
//           <button
//             type="button"
//             className="cs-button cs-button-secondary"
//             onClick={() => navigate(-1)}
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             className="cs-button cs-button-primary"
//             onClick={handleSave}
//             disabled={saving}
//           >
//             {saving ? "Updating..." : "Update Cost Sheet"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CostSheetEdit;
