
import React, { useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/tropical_island (1).glb')
  const { actions } = useAnimations(animations, group)
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group
                name="_15cf_Var2_LOD0_0"
                position={[3.492, -0.398, 1.482]}
                rotation={[0.053, -0.004, -0.111]}
                scale={0.01}>
                <mesh
                  name="Object_4"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_4.geometry}
                  material={materials.Cat_Palm}
                />
              </group>
              <group
                name="_18f6_Var1_LOD0_1"
                position={[-4.135, -0.127, 0.833]}
                rotation={[-0.014, -0.002, 0.105]}
                scale={0.01}>
                <mesh
                  name="Object_6"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_6.geometry}
                  material={materials.Areca_Palm}
                />
              </group>
              <group
                name="_1ffc_Var3_LOD0_2"
                position={[2.461, -0.034, -1.376]}
                rotation={[-0.046, 0.882, -0.101]}
                scale={0.01}>
                <mesh
                  name="Object_8"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_8.geometry}
                  material={materials.Areca_Palm}
                />
              </group>
              <group
                name="_2688_Var3_LOD0_3"
                position={[2.128, -0.253, 1.614]}
                rotation={[0.054, 0, -0.111]}
                scale={0.01}>
                <mesh
                  name="Object_10"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_10.geometry}
                  material={materials.Cat_Palm}
                />
              </group>
              <group
                name="_3b4f_Var2_LOD0_4"
                position={[-1.028, 0.078, 2.394]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.01}>
                <mesh
                  name="Object_12"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_12.geometry}
                  material={materials.Tropical_Palm}
                />
              </group>
              <group
                name="_7303_Var2_LOD0_5"
                position={[1.802, -0.287, 2.491]}
                rotation={[0.132, -0.013, -0.135]}
                scale={0.01}>
                <mesh
                  name="Object_14"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_14.geometry}
                  material={materials.Areca_Palm}
                />
              </group>
              <group
                name="_89e2_Var5_LOD0_6"
                position={[-3.59, -0.085, -0.283]}
                rotation={[-0.014, -0.002, 0.105]}
                scale={0.01}>
                <mesh
                  name="Object_16"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_16.geometry}
                  material={materials.Areca_Palm}
                />
              </group>
              <group
                name="_8b2b_Var4_LOD0_7"
                position={[2.423, -0.143, 0.464]}
                rotation={[0.054, 0, -0.111]}
                scale={0.01}>
                <mesh
                  name="Object_18"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_18.geometry}
                  material={materials.Areca_Palm}
                />
              </group>
              <group
                name="_a2c9_Var3_LOD0_8"
                position={[2.602, -0.299, 1.901]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.01}>
                <mesh
                  name="Object_20"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_20.geometry}
                  material={materials.Tropical_Palm}
                />
              </group>
              <group
                name="_e0f8_Var1_LOD0_9"
                position={[-2.797, 0.038, -1.87]}
                rotation={[Math.PI / 2, 0, -1.124]}
                scale={0.01}>
                <mesh
                  name="Object_22"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_22.geometry}
                  material={materials.Tropical_Palm}
                />
              </group>
              <group
                name="_e1f4_Var1_LOD0_10"
                position={[-4.374, -0.13, -0.19]}
                rotation={[0.091, 0.002, 0.028]}
                scale={0.01}>
                <mesh
                  name="Object_24"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_24.geometry}
                  material={materials.Cat_Palm}
                />
              </group>
              <group
                name="_e74b_Var4_LOD0_11"
                position={[1.968, 0.046, -2.182]}
                rotation={[0.016, 0.669, -0.027]}
                scale={0.01}>
                <mesh
                  name="Object_26"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_26.geometry}
                  material={materials.Cat_Palm}
                />
              </group>
              <group name="Armature_40" position={[-0.28, 0.622, 0]}>
                <group name="GLTF_created_0">
                  <primitive object={nodes.GLTF_created_0_rootJoint} />
                  <skinnedMesh
                    name="Object_31"
                    geometry={nodes.Object_31.geometry}
                    material={materials['Material.001']}
                    skeleton={nodes.Object_31.skeleton}
                  />
                  <group name="Spiral002_39" />
                </group>
              </group>
              <group
                name="Aset_other__M_ufhsea0fa_LOD2_41"
                position={[-0.023, 0.053, 1.664]}
                rotation={[1.631, -0.021, -1.584]}>
                <mesh
                  name="Object_60"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_60.geometry}
                  material={materials.Treibholz}
                />
              </group>
              <group
                name="Aset_other_forest_root_M_ufhrfjefa_LOD2_42"
                position={[-0.336, 0.006, -1.974]}>
                <mesh
                  name="Object_62"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_62.geometry}
                  material={materials.Root}
                />
              </group>
              <group
                name="Aset_rock_assembly_M_udxkec2fa_LOD2_43"
                position={[1.64, -2.196, 12.346]}>
                <mesh
                  name="Object_64"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_64.geometry}
                  material={materials.RocksBig}
                />
              </group>
              <group name="Beach_44" position={[-0.28, 0, 0]}>
                <mesh
                  name="Object_66"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_66.geometry}
                  material={materials.BeachBaked}
                />
              </group>
              <group
                name="Palme_45"
                position={[2.076, 0.016, -1.778]}
                rotation={[1.544, -0.079, -2.333]}>
                <mesh
                  name="Object_68"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_68.geometry}
                  material={materials.Palme}
                />
              </group>
              <group
                name="Plane024_46"
                position={[2.844, 3.561, -2.033]}
                rotation={[-3.137, -0.584, -3.103]}>
                <mesh
                  name="Object_70"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_70.geometry}
                  material={materials.Palme_Blaetter}
                />
              </group>
              <group name="RocksSmall_47" position={[-11.774, -1.788, -7.852]}>
                <mesh
                  name="Object_72"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_72.geometry}
                  material={materials.RocksSmall}
                />
              </group>
              <group
                name="Skybox_48"
                position={[-0.019, -1.968, 0]}
                rotation={[-Math.PI, -0.788, -Math.PI]}
                scale={0.518}>
                <mesh
                  name="Object_74"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_74.geometry}
                  material={materials['Skybox.001']}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}


useGLTF.preload('/tropical_island (1).glb')
export default Model;
