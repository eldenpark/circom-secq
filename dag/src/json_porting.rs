use super::{Tree, DAG};
use circom_algebra::algebra::Constraint;
use circom_algebra::num_bigint::BigInt;
use constraint_writers::debug_writer::DebugWriter;
use constraint_writers::json_writer::ConstraintJSON;
use json::JsonValue;
use std::collections::HashMap;

type C = Constraint<usize>;

fn transform_constraint_to_json(constraint: &C) -> JsonValue {
    JsonValue::Array(vec![
        hashmap_as_json(constraint.a()),
        hashmap_as_json(constraint.b()),
        hashmap_as_json(constraint.c()),
    ])
}

fn hashmap_as_json(values: &HashMap<usize, BigInt>) -> JsonValue {
    let mut order: Vec<&usize> = values.keys().collect();
    order.sort();
    let mut correspondence = json::object! {};
    for i in order {
        let (key, value) = values.get_key_value(i).unwrap();
        let value = value.to_str_radix(10);
        correspondence[format!("{}", key)] = value.as_str().into();
    }
    correspondence
}

fn ext_hashmap_as_json(
    id_to_name: &HashMap<usize, String>,
    values: &HashMap<usize, BigInt>,
) -> JsonValue {
    let mut order: Vec<&usize> = values.keys().collect();
    order.sort();
    let mut correspondence = json::object! {};
    for i in order {
        let (key, value) = values.get_key_value(i).unwrap();
        let value = value.to_str_radix(10);

        let name = if *key == 0 { "constant" } else { id_to_name.get(key).unwrap() };

        correspondence[format!("{}", name)] = value.as_str().into();
    }
    correspondence
}

fn visit_tree(tree: &Tree, writer: &mut ConstraintJSON) -> Result<(), ()> {
    println!("visit_tree: {:?}", tree.id_to_name);

    for constraint in &tree.constraints {
        let json_value = transform_constraint_to_json(&constraint);
        writer.write_constraint(&json_value.to_string())?;
    }
    for edge in Tree::get_edges(tree) {
        let subtree = Tree::go_to_subtree(tree, edge);
        visit_tree(&subtree, writer)?;
    }
    Result::Ok(())
}

pub fn port_constraints(dag: &DAG, debug: &DebugWriter) -> Result<(), ()> {
    println!("port_constraints(): constraint count: {}", &Tree::new(dag).constraints.len());

    let mut writer = debug.build_constraints_file()?;
    visit_tree(&Tree::new(dag), &mut writer)?;
    writer.end().unwrap();

    let mut writer_ext = debug.build_constraints_ext_file()?;
    visit_tree_ext(&Tree::new(dag), &mut writer_ext)?;
    writer_ext.end().unwrap();

    Ok(())
}

fn visit_tree_ext(tree: &Tree, writer: &mut ConstraintJSON) -> Result<(), ()> {
    println!("visit_tree_ext: {:?}", tree.id_to_name);

    for constraint in &tree.constraints {
        // let json_value = transform_constraint_to_json(&constraint);

        let json_value = JsonValue::Array(vec![
            ext_hashmap_as_json(&tree.id_to_name, constraint.a()),
            ext_hashmap_as_json(&tree.id_to_name, constraint.b()),
            ext_hashmap_as_json(&tree.id_to_name, constraint.c()),
        ]);

        writer.write_constraint(&json_value.to_string())?;
    }
    for edge in Tree::get_edges(tree) {
        let subtree = Tree::go_to_subtree(tree, edge);
        visit_tree(&subtree, writer)?;
    }
    Result::Ok(())
}
