use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn estimate_scan_cost(rows: f64, indexed: bool) -> f64 {
    let safe_rows = rows.max(1.0);
    if indexed {
        safe_rows.log2() * 0.8 + safe_rows * 0.0004
    } else {
        safe_rows * 0.0011
    }
}

#[wasm_bindgen]
pub fn estimate_filter_rows(rows: f64, predicates: u32, contains_or: bool) -> f64 {
    let safe_rows = rows.max(1.0);
    let predicate_count = predicates.max(1) as f64;
    let selectivity = if contains_or {
        0.45
    } else {
        (0.28 / predicate_count).max(0.03)
    };
    (safe_rows * selectivity).max(1.0)
}

#[wasm_bindgen]
pub fn estimate_sort_cost(rows: f64) -> f64 {
    let safe_rows = rows.max(2.0);
    safe_rows * safe_rows.log2() / 30_000.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn indexed_scan_is_cheaper_for_large_relations() {
        assert!(estimate_scan_cost(1_000_000.0, true) < estimate_scan_cost(1_000_000.0, false));
    }

    #[test]
    fn more_and_predicates_reduce_output_rows() {
        assert!(estimate_filter_rows(100_000.0, 3, false) < estimate_filter_rows(100_000.0, 1, false));
    }
}
