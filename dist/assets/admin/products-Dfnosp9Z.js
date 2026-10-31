import{s as n}from"../supabase-client-BCUvSBAr.js";import{i as c}from"../admin-navigation-CfdeLVZw.js";import{a as i}from"../formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";let l=null;async function s(){const o=await c();if(!o)return;l=o.session;const{data:a,error:d}=await n.from("products").select("*, product_categories(name, slug)").is("archived_at",null).order("price",{ascending:!0}),e=document.getElementById("productsTableContainer");if(d||!a||a.length===0){e.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No packages configured.</p>';return}e.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 650px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Code / Name</th>
              <th style="padding: 12px;">Category</th>
              <th style="padding: 12px;">Cost</th>
              <th style="padding: 12px;">Cycle</th>
              <th style="padding: 12px;">Daily Settlement</th>
              <th style="padding: 12px;">Total Payout</th>
              <th style="padding: 12px;">Status</th>
              <th style="padding: 12px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${a.map(t=>{var r;return`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px;">
                  <strong style="color: var(--deep-forest); font-family: monospace;">${t.code}</strong>
                  <div style="font-size: 0.75rem; color: var(--secondary-text);">${t.name}</div>
                </td>
                <td style="padding: 12px; font-weight: 600;">${((r=t.product_categories)==null?void 0:r.name)||"VIP"}</td>
                <td style="padding: 12px; font-weight: 700; color: var(--primary-green);">${i(t.price)}</td>
                <td style="padding: 12px;">${t.duration_days} Days</td>
                <td style="padding: 12px; color: var(--metallic-gold); font-weight: 700;">${t.daily_income>0?i(t.daily_income):"—"}</td>
                <td style="padding: 12px; font-weight: 700;">${i(t.total_payout)}</td>
                <td style="padding: 12px;">
                  <span class="badge-status ${t.is_active?"badge-completed":"badge-pending"}">
                    ${t.is_active?"Active":"Closed"}
                  </span>
                </td>
                <td style="padding: 12px;">
                  <button class="${t.is_active?"btn-emerald":"btn-gold"}" style="padding: 6px 12px; font-size: 0.75rem;" onclick="toggleStatus('${t.id}', ${!t.is_active})">
                    ${t.is_active?"Deactivate":"Activate"}
                  </button>
                  <button style="padding: 6px 12px; font-size: 0.75rem; margin-left: 6px; background: #FEE2E2; color: #B91C1C; border: 1px solid #FCA5A5; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="deleteProduct('${t.id}', this)" data-name="${String(t.name).replace(/"/g,"&quot;")}">
                    Delete
                  </button>
                </td>
              </tr>
            `}).join("")}
          </tbody>
        </table>
      `}window.toggleStatus=async function(o,a){const{data:d,error:e}=await n.rpc("admin_toggle_product_status",{p_admin_id:l.user.id,p_product_id:o,p_is_active:a});e||!d.success?alert("Failed to update product state"):s()};window.deleteProduct=async function(o,a){const d=a.dataset.name;if(!confirm(`Delete "${d}"?

If users already bought it, it will be removed from the store but their running packages keep paying out.`))return;a.disabled=!0,a.textContent="Deleting...";const{data:e,error:t}=await n.rpc("admin_delete_product",{p_product_id:o});if(t||!(e!=null&&e.success)){alert((t==null?void 0:t.message)||(e==null?void 0:e.message)||"Failed to delete product"),a.disabled=!1,a.textContent="Delete";return}alert(e.mode==="deleted"?`"${d}" was deleted.`:`"${d}" was removed from the store. ${e.investments} existing purchase(s) will keep running.`),s()};s();
